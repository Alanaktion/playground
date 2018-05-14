import sys
import argparse
from lxml import html
import requests

parser = argparse.ArgumentParser()
parser.add_argument('url', help='A starting URL to scrape from')
parser.add_argument('--no-parent', const='no_parent', action='store_const', help='Exclude paths above given url')
args = parser.parse_args()


