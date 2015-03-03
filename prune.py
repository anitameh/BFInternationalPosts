import numpy as np
import pandas as pd
import sys

def prune(DATA_DIR, threshold, finalcol):
	'''
	PRUNE if the final total number of pages for a particular city-country combo is less than 
	the 'threshold', remove the corresponding city-country from the dataset
	:param threshold: 
	:param finalcol:

	:return: outputs a csv to the current directory
	:rtype: dataframe outputted to csv
	'''
	for i in xrange(4):
		pathname = DATA_DIR + '/panel' + str(i) + '-data.csv'
		data = pd.read_csv(pathname)

		col_of_interest = data[finalcol].values
		new_data = data.iloc[ np.where( col_of_interest >= threshold) ]
		print 'panel', str(i), 'new length =', len(new_data)
		new_pathname = DATA_DIR + '/panel' + str(i) + '-new-data.csv'
		new_data.to_csv(new_pathname, index=False)

if __name__ == '__main__':

	DATA_DIR = 'internetbday-data/new-data'
	threshold = int( sys.argv[1] )
	finalcol = str( sys.argv[2] )
	
	prune(DATA_DIR, threshold, finalcol)