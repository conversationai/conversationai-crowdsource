#!/usr/local/bin/python3
__author__      = "Varada Kolhatkar"
import argparse
import pandas as pd
import numpy as np
from collections import Counter

SOCC_PATH = '/Users/vkolhatk/Data/SOCC/raw/'
TEMP_DATA_PATH = '/Users/vkolhatk/Data/tmp/'

def get_arguments():
    parser = argparse.ArgumentParser(description='Create a subset CSV of the given CSV')

    parser.add_argument('--articles_csv', '-a', type=str, dest='articles_csv', action='store',
                        default= SOCC_PATH + r'gnm_articles.csv',
                        help="The articles CSV")
    parser.add_argument('--comments_csv', '-c', type=str, dest='comments_csv', action='store',
                        default = SOCC_PATH + r'gnm_comments.csv',
                        help="The comments csv")

    parser.add_argument('--output_csv', '-o', type=str, dest='output_csv', action='store',
                        default=r'../output/gnm_comments_large_scale_annotation1.csv',
                        help="The top-level comments csv")

    parser.add_argument('--narticles', '-na', type=int, dest='narticles', action='store',
                        default=500,
                        help="The number of articles to be chosen")

    parser.add_argument('--ncomments', '-nc', type=int, dest='ncomments', action='store',
                        default=10000,
                        help="The number of comments to be chosen")

    args = parser.parse_args()
    return args

def choose_comments(articles_csv, comments_csv, narticles, ncomments, output_csv):
    '''
    :param articles_csv: (string) The path to the CSV file containing article information
    :param comments_csv: (string) The path to the CSV file containing comments information
    :param narticles: (integer) The number of articles to be selected
    :param ncomments: (integer) The number of comments to be selected
    :param output_csv: (string) The path to the CSV file to write the chosen comments
    :return: None
    
    Description: This function chooses ncomments from narticles and writes these comments
    along with article information in output_csv.
    '''

    # Read first narticles articles in dataframe article_df
    article_df = pd.read_csv(articles_csv, nrows = narticles)

    # Get probability distribution of number of comments per article
    total_comments = article_df['ntop_level_comments'].sum()
    article_df['prob'] = article_df['ntop_level_comments']/total_comments

    # Choose ncomments weighted by the probability distribution above
    ncomments_per_article = np.random.choice(article_df['article_id'].tolist(), size=ncomments, p=article_df['prob'].tolist())

    # Count the number of comments to be chosen per article
    c = Counter()
    for article_id in ncomments_per_article:
        c[article_id] += 1

    # Get only top-level comments 
    comments_df = pd.read_csv(comments_csv)
    top_level_comments_df = comments_df[comments_df['comment_counter'].str.count('_') == 2]
    
    # Choose number of comments per article as prompted by counter c and create a result dataframe
    frames = []
    
    for (article_id, ncomm) in c.items():
        subset_df = top_level_comments_df[top_level_comments_df['article_id'] == article_id]
        frames.append(subset_df.sample(ncomm))

    chosen_comments_df = pd.concat(frames)
    chosen_comments_df.rename(columns={'author': 'comment_author'}, inplace=True)
    
    # Get article information from the article dataframe
    result_df = chosen_comments_df.join(article_df.set_index('article_id'), on='article_id', sort=True)
    result_df['_golden'] = False
    
    # Rename some of the columns in the 
    result_df.rename(columns={'title': 'article_title'}, inplace=True)
    result_df.rename(columns={'author': 'article_author'}, inplace=True)
    result_df.rename(columns={'published_date': 'article_published_date'}, inplace=True)

    # Define the columns to be written and write the output csv
    cols = (['article_id', 'article_title', 'article_url', 'article_author', 'article_published_date', 'article_text',
             'comment_counter', 'comment_author', '_golden', 'comment_text'])
    result_df.to_csv(output_csv, columns = cols, index = False)
    print('The output CSV written: ', output_csv)


if __name__ == "__main__":
    args = get_arguments()
    print(args)
    choose_comments(args.articles_csv, args.comments_csv, args.narticles, args.ncomments, args.output_csv)

