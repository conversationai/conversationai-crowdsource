import numpy as np
    
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

def binarize_toxicity(toxicity_level):    
    '''
    :toxicity_level: (float) the toxicity level to be binarized
    :return: (str) binarized toxicity level 
    
    Given the toxicity_level, this function returns a binary 
    representation of the toxicity level. If toxicity_level > 1.8, 
    it is considered as a toxic comment else it is considered as 
    a non-toxic comment. 
    '''
    return 'yes' if toxicity_level >= 1.8 else 'no'
           