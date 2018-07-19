import matplotlib.pyplot as plt
import numpy as np

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
    