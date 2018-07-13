from collections import OrderedDict, Counter
import math

def list_and_sort(vals):
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

# aggregation method for text attributes
def concatenate(vals):
    L = []
    for val in vals:
        if type(val) != str and math.isnan(val):
            L.append('')
        else:
            L.append(str(val))

    return "\n".join(L)
