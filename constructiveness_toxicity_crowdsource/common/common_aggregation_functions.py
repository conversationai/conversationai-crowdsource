from collections import OrderedDict, Counter
import math

def list_and_sort(vals):
    '''
    :param vals: a list of strings 
    :return: str

    Description: This is an aggregation function for constructiveness and toxicity 
    characteristics annotated by a number of annotators.
    
    Given a list strings (vals), where each string denotes the characteristics annotated
    by an annotator (e.g., 'solution\n evidence'), this function calculates the 
    frequency of each value in all annotations, sorts the value-frequncy dictionary 
    on frequncies, and returns the sorted dictionary as a string.
    Examples: 
    >>> list_and_sort(['solution\n evidence', 'personal_story\n dialogue', 
                       'solution\n specific_points', 'solution', 'solution'])
    solution:4
    evidence:1
    personal_story:1
    dialogue:1
    specific_points:1
    '''
    cnt = Counter()
    all_vals = []
    for v in vals: 
        all_vals.extend(v.split())
        
    for val in all_vals:
        val = val.strip()
        cnt[val] += 1
        L = cnt.most_common()
        #print('L:', L)
        L1 = [key + ':' + str(freq) for (key, freq) in L] 
        #L = sorted(cnt, key=cnt.get, reverse=True)
    return '\n'.join(L1)

def concatenate(vals):
    '''
    :param vals: a list of strings 
    :return: str

    Description: This is an aggregation function for text attributes 
    (e.g., annotator comments). This function simply concatenates 
    all values, replacing nan values with an empty string, and 
    returns this concatenated string. 
    
    Examples: 
    >>> concatenate([float('nan'), 'yes', 'no', float('nan'), 'yes'])
    yes
    no
    yes
    '''    
    
    L = []
    for val in vals:
        if type(val) != str and math.isnan(val):
            L.append('')
        else:
            L.append(str(val))

    return '\n'.join(L)

if __name__=='__main__':
    print('list_and_sort aggregation exmaple: ')
    print('INPUT: ', "['solution\n evidence', 'personal_story\n dialogue', 'solution\n specific_points', 'solution', 'solution']")
    print(list_and_sort(['solution\n evidence', 'personal_story\n dialogue', 
                       'solution\n specific_points', 'solution', 'solution']))
    
    print('\n\n concatenate aggregation example: ')
    print('INPUT: ', "[float('nan'), 'yes', 'no', float('nan'), 'yes']")
    print(concatenate([float('nan'), 'yes', 'no', float('nan'), 'yes']))


