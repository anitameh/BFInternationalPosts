import sys

import numpy as np
import pandas as pd

'''
GOAL: Convert raw data file from Google Analytics into a file that is useable in the international post visualization.

ASSUMPTIONS ABOUT THE DATA:

* All punctuation (i.e. commas) are removed from the Total Events column
* Data is sorted chronologically by date (beginning date first)
* Data is coming from Google Analytics
* A separate directory title "data" exists

Final format will look like this:

__countryID__ | __country__ | __language__ | __cumulative PV's, day 1__ | ... | __cumulative PV's, day n__
'''

def main():
	'''
	:Str input_file: Pathname to data file (e.g. "data/daily-original-data.csv")
	:int numdays: Number of days in the time period that the data was obtained from Google Analytics
	:Str world_names: Pathname to country names and its ISO 3166-1 numeric id's 
						(can be found at http://www.iso.org/iso/country_codes.htm);
						For this project, use Anita's modified version w/ colloquial country names
						(can be found at https://gist.github.com/anitameh/78fda45d35ba2286c3f4#file-unique-countries-csv)

	:rtype: csv
	:return outputDF: Output a dataframe in the form of a csv, to the data directory ("just-daily-totals.csv")
	'''
	input_file, numdays, world_names = sys.argv[1], int(sys.argv[2]), sys.argv[3]

	# ingest data and get rid of extra rows
	data = pd.read_csv(input_file, skiprows=6)
	data.columns = ["Country", "Date", "Pageviews"]

	remove_this = numdays + 4 # 4 = total, extra space row, and header
	data = data[:-remove_this]

	data = data[data.Country != "(not set)"] # remove (not set) rows

	# begin building dataframe for output
	outputDF = pd.DataFrame(columns = ["Country", "Language"])



	# 1. Add in COUNTRY names
	outputDF.Country = np.unique((data.Country).tolist())

	# 2. Drop in PAGEVIEW totals
	#	Each date column has total pageviews per country up to and including that date. 
	#	If there are no pageviews for a particular country at a particular date, the value ought to be 0.
	alldates = np.unique(data.Date).tolist()
	for i in xrange( len(alldates) ):
	    
		# get date
		thedate = alldates[i]
		thedate_pvs = data[data.Date == thedate]

		# merge data
		main = pd.DataFrame(outputDF.Country)
		merged = main.merge(thedate_pvs, how="outer")

		# replace NaN's with 0
		merged.Pageviews[np.isnan(merged.Pageviews)] = 0

		if (i != 0):
			# We want the sum! since the previous column is the sum of the previous columns, we just
			#    need to add the new values to the last column
			prevdate = alldates[i-1]
			thedate_pvs = merged.Pageviews + outputDF[prevdate]
			outputDF[thedate] = thedate_pvs
		else:
			outputDF[thedate] = merged.Pageviews

	# 3. COUNTRY ID'S
	theid = pd.read_csv(world_names)
	theid.columns = ["id", "Country"]

	IDmerged = outputDF.merge(theid, on="Country")
	outputDF = IDmerged

	# 4. LANGUAGE
	# spanish
	spanish = ["Argentina", "Chile", "Colombia", "Costa Rica", "Mexico", "Panama", "Peru", "Puerto Rico", "Spain", "Venezuela"]
	for i in xrange( len(spanish) ):
		outputDF.loc[outputDF.Country == spanish[i], "Language"] = "es"

	# french
	french = ["France", "Luxembourg", "Belgium"]
	for i in xrange( len(french) ):
		outputDF.loc[outputDF.Country == french[i], "Language"] = "fr"
	    
	# portuguese
	portuguese = ["Brazil", "Portugal"]
	for i in xrange( len(portuguese) ):
		outputDF.loc[outputDF.Country == portuguese[i], "Language"] = "pt"
	    
	# french
	german = ["Germany"]
	for i in xrange( len(german) ):
		outputDF.loc[outputDF.Country == german[i], "Language"] = "de"

	# english
	for j in xrange( len(outputDF) ):
		if ( type(outputDF.Language[j]) == float ):
			outputDF.Language[j] = "en"



	# output to csv
	outputDF.to_csv("data/just-daily-totals-data.csv", index=False)



if __name__ == '__main__':
	main()




