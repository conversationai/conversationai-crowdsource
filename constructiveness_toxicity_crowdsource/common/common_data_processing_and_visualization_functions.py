import matplotlib.pyplot as plt

# create and save plots
def create_plot(size, labels, colors, title = 'Test', dpi = 300):
    plt.gcf().clear()
    # Create a circle for the center of the plot
    patches, texts, autotexts  = plt.pie(size, labels = labels, autopct='%.1f%%', colors = colors)
    #plt.legend(patches, labels, loc="best")
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