import pandas as pd
import numpy as np
import math
import common_aggregation_functions
from common_aggregation_functions import *

class CrowdsourceAggregator:
    
    def __init__(self, input_csv):
        self.df = pd.read_csv(input_csv)
        
    def get_gold_questions(self):
        return self.df.query('_golden == True')
    
    def get_non_gold_questions(self):
        return self.df.query('_golden == False')
            
    def get_nannotators(self):
        return len(self.non_gold_df['_worker_id'].unique())
        
    def aggregate_annotations(self, df, attribs):
        # Relevant columns 
        unit_id_col = attribs['unit_id_col']        
        meta_cols = attribs['meta_cols']
        avg_cols = attribs['avg_cols']
        nominal_cols = attribs['nominal_cols']
        text_cols = attribs['text_cols']
        
        # Replace text values with numerical values in the dataframe
        attrs = self.df[avg_cols].replace(['yes', 'no', 'partially', 'not_sure', 'noopinion'], [1, 0, 0.5, 0.5, np.nan])
        
        other_cols = unit_id_col + meta_cols + nominal_cols + text_cols
        df = df[other_cols].join(attrs)
        
        # agreegation method for each class of attributes
        avg_dict = {k: 'mean' for k in avg_cols}
        meta_dict = {k: 'first' for k in meta_cols}
        nominal_dict = {k: common_aggregation_functions.list_and_sort for k in nominal_cols}
        text_dict = {k: common_aggregation_functions.concatenate for k in text_cols}
        
        agg_dict = {**avg_dict, **meta_dict, **nominal_dict, **text_dict}
        
        # Aggregate the results for all workers on a particular comment
        aggregated_df = df.groupby(unit_id_col).agg(agg_dict)
        for col in avg_cols:
            aggregated_df[col] = aggregated_df[col].apply(pd.to_numeric)
            aggregated_df[col] = aggregated_df[col].apply(lambda x: round(x,2))

        return aggregated_df
    
    def write_csv(self, dframe, cols, csv_path):
        dframe.to_csv(csv_path, columns = cols, index = False)
        print('CSV written: ', csv_path)
        
if __name__=='__main__':
    pass




        