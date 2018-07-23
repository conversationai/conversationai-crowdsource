import pandas as pd
import numpy as np
import krippendorff
from krippendorff import alpha
from data_normalization_functions import *

def nominal_metric(a, b):
    return a != b


def interval_metric(a, b):
    return (a-b)**2


def ratio_metric(a, b):
    return ((a-b)/(a+b))**2


def krippendorff_alpha(data, metric=interval_metric, force_vecmath=False, convert_items=float, missing_items=None):
    '''
    Calculate Krippendorff's alpha (inter-rater reliability):
    
    data is in the format
    [
        {unit1:value, unit2:value, ...},  # coder 1
        {unit1:value, unit3:value, ...},   # coder 2
        ...                            # more coders
    ]
    or 
    it is a sequence of (masked) sequences (list, numpy.array, numpy.ma.array, e.g.) with rows corresponding to coders and
    columns to items
    
    metric: function calculating the pairwise distance
    force_vecmath: force vector math for custom metrics (numpy required)
    convert_items: function for the type conversion of items (default: float)
    missing_items: indicator for missing items (default: None)
    '''
    
    # number of coders
    m = len(data)
    
    # set of constants identifying missing values
    if missing_items is None:
        maskitems = []
    else:
        maskitems = list(missing_items)
    if np is not None:
        maskitems.append(np.ma.masked_singleton)
    
    # convert input data to a dict of items
    units = {}
    for d in data:
        try:
            # try if d behaves as a dict
            diter = d.items()
        except AttributeError:
            # sequence assumed for d
            diter = enumerate(d)
            
        for it, g in diter:
            if g not in maskitems:
                try:
                    its = units[it]
                except KeyError:
                    its = []
                    units[it] = its
                its.append(convert_items(g))


    units = dict((it, d) for it, d in units.items() if len(d) > 1)  # units with pairable values
    n = sum(len(pv) for pv in units.values())  # number of pairable values
    
    if n == 0:
        raise ValueError("No items to compare.")
    
    np_metric = (np is not None) and ((metric in (interval_metric, nominal_metric, ratio_metric)) or force_vecmath)
    
    Do = 0.
    for grades in units.values():
        if np_metric:
            gr = np.asarray(grades)
            Du = sum(np.sum(metric(gr, gri)) for gri in gr)
        else:
            Du = sum(metric(gi, gj) for gi in grades for gj in grades)
        Do += Du/float(len(grades)-1)
    Do /= float(n)

    if Do == 0:
        return 1.

    De = 0.
    for g1 in units.values():
        if np_metric:
            d1 = np.asarray(g1)
            for g2 in units.values():
                De += sum(np.sum(metric(d1, gj)) for gj in g2)
        else:
            for g2 in units.values():
                De += sum(metric(gi, gj) for gi in g1 for gj in g2)
    De /= float(n*(n-1))

    return 1.-Do/De if (Do and De) else 1.


def calculate_inter_annotator_agreement(df, question_column, golden=False):
    '''
    :df: (pandas.DataFrame) the dataframe containing all crowd annotations
    :golden: (bool) a variable indicating whether we are measuring agreement 
             on gold or non-gold questions
    :retuen: None
    Description: 
    '''    
    
    # If golden flag is False, get rid of the gold questions
    if golden == False: 
        df = df.query('_golden == False')
    else: 
        df = df.query('_golden == True')
    
    nannotators = len(df['_worker_id'].unique())
    ncols = len(df['comment_counter'].unique().tolist())
    
    # Create a new DataFrame for inter-annotator agreement data
    annotation_df = pd.DataFrame(np.full((nannotators, ncols), '*'), 
                                 index = df['_worker_id'].unique().tolist(), 
                                 columns = df['comment_counter'].unique().tolist())
    
    for index, row in df.iterrows():
        annotation_df.loc[row['_worker_id']][row['comment_counter']] = 1 if row[question_column] == 'yes' else 0
        
    reliability_data = annotation_df.values.tolist()
    print('Length of the data: ', len(reliability_data))
    
    missing = '*' # indicator for missing values
    
    krippendorff_alpha = krippendorff_alpha(reliability_data, metric = nominal_metric, missing_items=missing)
    print("Krippendorff's alpha with nominal metric: %.3f" % krippendorff_alpha)
    retirm krippendorff_alpha

            
def secret_gold_evaluation_constructiveness(df):
    '''
    :df: (pandas.DataFrame)
    :return: (float) Secret gold evaluation results for constructiveness
    '''
    # Get a subset dataframe with internal gold questions for constructiveness
    internal_gold_con_df = df[df['constructive_internal_gold'].notnull()].copy()
    percentage_multiplier = 100.0/internal_gold_con_df.shape[0]
    
    # Binarize constructiveness for easy comparison. 
    internal_gold_con_df['constructive_binary'] = internal_gold_con_df['constructive'].apply(binarize_constructiveness)
    
    # Find out the number of instances of disagreement between the gold and the aggregated crowd answer. 
    # If this number is high (>5, more than 25%) we should be worried.  
    constructiveness_disagreement_df = internal_gold_con_df[internal_gold_con_df['constructive_binary'] !=
                                       internal_gold_con_df['constructive_internal_gold']]
        
    #show_comments(constructiveness_disagreement_df, ['constructive_internal_gold', 'constructive_binary'])
    return round(constructiveness_disagreement_df.shape[0] * percentage_multiplier, 2)
    
    
def secret_gold_evaluation_toxicity(df):
    '''
    :df: (pandas.DataFrame)
    :return: (float) Secret gold evaluation results for toxicity
    '''    
    # Get a subset dataframe with internal gold questions for toxicity
    internal_gold_tox_df = df[df['crowd_toxicity_level_internal_gold'].notnull()].copy()
    percentage_multiplier = 100.0/internal_gold_tox_df.shape[0]
    internal_gold_tox_df['crowd_toxicity_level_binary'] = internal_gold_tox_df['crowd_toxicity_level'].apply(binarize_toxicity)
    internal_gold_tox_df['crowd_toxicity_level_internal_gold_binary'] = \
    (internal_gold_tox_df['crowd_toxicity_level_internal_gold'].apply(binarize_toxicity_with_multiple_answers))    
    # Find out the number of instances of disagreement between the gold and the aggregated crowd answer. 
    # If this number is high (>5, more than 25%) we should be worried.  
    toxicity_disagreement_df = (internal_gold_tox_df[internal_gold_tox_df['crowd_toxicity_level_internal_gold_binary'] != 
                                                    internal_gold_tox_df['crowd_toxicity_level_binary']])
    
    #show_comments(toxicity_disagreement_df, ['crowd_toxicity_level_internal_gold_binary', 'crowd_toxicity_level_binary'] )    
    return round(toxicity_disagreement_df.shape[0] * percentage_multiplier, 2)

if __name__ == "__main__":    
    pass
    