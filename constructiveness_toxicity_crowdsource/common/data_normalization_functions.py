import numpy as np
TOXICITY_LEVEL_THRESHOLD = 1.8
CONSTRUCTIVENESS_SCORE_THRESHOLD = 0.6

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
    return 'yes' if float(toxicity_level) >= TOXICITY_LEVEL_THRESHOLD else 'no'


def binarize_toxicity_with_multiple_answers(toxicity_level):    
    '''
    :toxicity_level: (float/str) the toxicity level to be binarized
    :return: (str) binarized toxicity level 
    
    Given the toxicity_level, this function returns a binary 
    representation of the toxicity level. If toxicity_level > TOXICITY_LEVEL_THRESHOLD, 
    it is considered as a toxic comment else it is considered as 
    a non-toxic comment. 
    '''
    if type(toxicity_level) == str:
        toxicity = toxicity_level.split()
        if ('2' in toxicity or '3' in toxicity or '4' in toxicity):
            return 'yes'
        else:
            return 'no'
        
    return 'yes' if float(toxicity_level) >= TOXICITY_LEVEL_THRESHOLD else 'no'


def binarize_constructiveness(constructiveness_score):    
    '''
    :constructiveness_score: (float) the constructiveness_score to be binarized
    :return: (str) binarized constructiveness 
    
    Given the constructiveness_score, this function returns a binary 
    representation of the constructiveness_score. If constructiveness_score > 
    CONSTRUCTIVENESS_SCORE_THRESHOLD, it is considered as a constructive comment 
    else it is considered as a non-constructive comment. 
    '''
    return 'yes' if constructiveness_score >= CONSTRUCTIVENESS_SCORE_THRESHOLD else 'no'

