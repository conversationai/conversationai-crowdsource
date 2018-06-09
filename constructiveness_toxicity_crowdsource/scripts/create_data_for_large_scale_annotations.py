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

    parser.add_argument('--top_level_comments_csv', '-tlc', type=str, dest='tlc_csv', action='store',
                        default = TEMP_DATA_PATH + r'gnm_comments_top_level.csv',
                        help="The top-level comments csv")

    parser.add_argument('--output_csv', '-o', type=str, dest='output_csv', action='store',
                        default=r'../output/gnm_comments_large_scale_annotation.csv',
                        help="The top-level comments csv")

    parser.add_argument('--narticles', '-na', type=int, dest='narticles', action='store',
                        default=500,
                        help="The number of articles to be chosen")

    parser.add_argument('--ncomments', '-nc', type=int, dest='ncomments', action='store',
                        default=10000,
                        help="The number of comments to be chosen")

    args = parser.parse_args()
    return args

def choose_comments(articles_csv, tlc_csv, narticles, ncomments, output_csv):
    '''
    :param articles_csv: The CSV containing article information
    :param tlc_csv: The CSV containing top-level comments
    :param narticles: The number of articles to be selected
    :param ncomments: The number of comments to be selected
    :param output_csv: The output file for annotation
    :return: None
    Description: This function chooses ncomments from narticles and writes these comments
    along with article information in output_csv.
    '''

    # Read first narticles articles in dataframe adf
    adf = pd.read_csv(articles_csv, nrows = narticles)

    # Get probability distribution of number of comments per article
    total_comments = adf['ntop_level_comments'].sum()
    adf['prob'] = adf['ntop_level_comments']/total_comments

    # Choose ncomments weighted by the probability distribution above
    ncomments_per_article = np.random.choice(adf['article_id'].tolist(), size=ncomments, p=adf['prob'].tolist())

    # Count the number of comments to be chosen per article
    c = Counter()
    for aid in ncomments_per_article:
        c[aid] += 1

    # Choose number of comments per article as prompted by counter c and create a result dataframe
    tlcdf = pd.read_csv(tlc_csv)
    frames = []
    # the counter object c tells us how many comments to pick from each article.
    for (aid, ncomm) in c.items():
        subset_df = tlcdf[tlcdf['article_id'] == aid]
        frames.append(subset_df.sample(ncomm))

    result = pd.concat(frames)

    # Get article information from the article dataframe
    result['article_title'] = result.article_id.map(adf.set_index('article_id')['title'])
    result['article_url'] = result.article_id.map(adf.set_index('article_id')['article_url'])
    result['article_text'] = result.article_id.map(adf.set_index('article_id')['article_text'])
    result['article_author'] = result.article_id.map(adf.set_index('article_id')['author'])
    result['article_published_date'] = result.article_id.map(adf.set_index('article_id')['published_date'])
    result['_golden'] = False
    result.rename(columns={'author': 'comment_author'}, inplace=True)

    # Define the columns to be written and write the output csv
    cols = (['article_id', 'article_title', 'article_url', 'article_author', 'article_published_date', 'article_text',
             'comment_counter', 'comment_author', '_golden', 'comment_text'])
    result.to_csv(output_csv, columns = cols, index = False)


if __name__ == "__main__":
    args = get_arguments()
    print(args)
    choose_comments(args.articles_csv, args.tlc_csv, args.narticles, args.ncomments, args.output_csv)

