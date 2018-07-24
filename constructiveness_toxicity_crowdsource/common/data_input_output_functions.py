import pandas as pd
import sys
import glob
import ntpath

def get_full_annotation_csv(data_path, batch):
    '''
    :data_path: (str) the path of the directory containing annotated data CSVs
    :batch: (int) annotation batch number
    :return: (str) the path containing the full annotation CSV
    
    Description: Goven the data path and the batch number, extract and return the 
    path of the CSV containing full data annotations. The input data path may contain 
    multiple data CSVs. We want to extract the one following the form: 
    batch[\d]_f[\d]+.csv
    
    Example:
    >>> batch = 8    
    >>> data_path = '../CF_output/constructiveness/batch8/'
    >>> get_full_annotation_csv(data_path, batch)
    >>> '../CF_output/constructiveness/batch8/batch8_f1285429.csv'
    '''
    
    input_csv_files = [f for f in glob.glob(data_path + 'batch' + str(batch) + '_f*.csv') 
                                               if ntpath.basename(f).count('_') == 1]
    # We need exactly one input file in the input_csv_files.
    # Fail if there are more or less files in the list.     
    assert len(input_csv_files) == 1
    return input_csv_files[0]

if __name__ == "__main__":
    batch = 8
    data_path = '../CF_output/constructiveness/batch' + str(batch) + '/'
    print(get_full_annotation_csv(data_path, batch))
   