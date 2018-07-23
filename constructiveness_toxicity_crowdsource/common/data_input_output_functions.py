import pandas as pd
import sys
import glob
import ntpath

def get_full_annotation_csv(data_path, batch):
    '''
    :data_path: (str) the path of the directory containing annotated data CSVs
    :batch: (int) annotation batch number
    :return: (str) the path containing the full annotation CSV
    '''
    
    input_csv_files = [f for f in glob.glob(data_path + 'batch' + str(batch) + '_f*.csv') 
                                               if ntpath.basename(f).count('_') == 1]
    if len(input_csv_files) > 1:
        print('Please review your input dir. There seem to be more than one input files. ')
        sys.exit(0)
    else:
        return input_csv_files[0]
    