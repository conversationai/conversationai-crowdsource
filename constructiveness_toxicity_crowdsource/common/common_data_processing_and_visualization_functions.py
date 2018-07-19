import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import krippendorff
from krippendorff import alpha

# create and save plots
def plot_donut_chart(size, labels, colors, title = 'Test', dpi = 300):
    '''    
    :param size: (list of floats) Sizes for each slice in the donut plot 
    :param labels: (list of strs) Labels for each slice in the donut plot
    :param colors: (list of strs) Colour names for each slice in the donut plot
    :param title: (str) The title of the plot. The default value is 'Test'
    :param dpi: (int) The resolution for the plot. The default value is 300
    :return: None 
    Description: Given size, labels, colors, title, and dpi, this function
    plots a shows a donut plot. 
    
    Examples: 
    >>> size = [44.0, 44.0, 12.0]
    >>> labels = 'Constructive', 'Non constructive', 'Not sure'
    >>> colors = ['xkcd:green', 'xkcd:red', 'xkcd:orange']
    >>> Title = 'Constructiveness distribution'
    >>> create_plot(size, labels, colors, title)
    '''     
    plt.gcf().clear()
    
    # Create a circle for the center of the plot
    patches, texts, autotexts  = plt.pie(size, labels = labels, autopct='%.1f%%', colors = colors)
    p = plt.gcf()
    
    # Create a circle for the center of the plot
    my_circle=plt.Circle( (0,0), 0.7, color='white')
    p.gca().add_artist(my_circle)
    plt.axis('equal')
    plt.title(title)
    plt.draw()
    plt.show()
    #plt.savefig(save_file_name, dpi=dpi)
    #print('Plot saved at the location: ', save_file_name)
    
def nominalize_constructiveness(constructiveness_score):
    '''
    :constructiveness_score: (float) The constructiveness score for nominalizing
    :return: (str) The nominalized constructiveness label
    '''
    try: 
        if constructiveness_score > 0.6:
            return 'yes'
        elif constructiveness_score < 0.4:
            return 'no'
        else:
            return 'not_sure'
    except:
        print("Error in the input: ", constructiveness_score)
        return np.nan
    
def nominalize_toxicity(toxicity_value):
    '''
    :toxicity_value: (int) The toxicity level for nominalizing
    :return: (str) The nominalized toxicity level
    '''    
    try: 
        if toxicity_value > 3:
            return 'Very toxic'
        elif toxicity_value > 2:
            return 'Toxic'
        elif toxicity_value > 1:
            return 'Mildly toxic'
        else:
            return 'Not toxic'
    except:
        print("Error in the input: ", toxicity_value)
        return np.nan

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
    it is a sequence of (masked) sequences (list, numpy.array, numpy.ma.array, e.g.) with rows corresponding to coders and columns to items
    
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

def calculate_inter_annotator_agreement(df, golden=False):
    '''
    :df: (pandas.DataFrame) the dataframe containing all crowd annotations    
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
        annotation_df.loc[row['_worker_id']][row['comment_counter']] = 1 if row['constructive'] == 'yes' else 0
        
    reliability_data = annotation_df.values.tolist()
    print(len(reliability_data))
    
    missing = '*' # indicator for missing values
    array = [d.split() for d in data]  # convert to 2D list of string items
    
    print("nominal metric: %.3f" % krippendorff_alpha(reliability_data, metric = nominal_metric, missing_items=missing))
    
    
    
df = pd.read_csv('/Users/vkolhatk/dev/Collaboration_with_Jigsaw/CF_output/f1251409.csv')
calculate_inter_annotator_agreement(df)
    
    
    