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
* Dates are in standard ISO format without dashes (e.g. YYYYMMDD)

Final format will look like this:

__countryID__ | __country__ | __language__ | __cumulative PV's, day 1__ | ... | __cumulative PV's, day n__
'''

def main():
	'''
	:Str input_file: Pathname to data file (e.g. "new-data/daily-original-data.csv")
	:int numdays: Number of days in the time period that the data was obtained from Google Analytics
	:str latlong_file: Pathname to lat-long file

	:rtype: csv
	:return outputDF: Output a dataframe in the form of a csv, to the data directory ("just-daily-totals.csv")
	'''
	input_file, numdays, latlong_file = sys.argv[1], int(sys.argv[2]), sys.argv[3]

	# ingest data and get rid of extra rows
	data = pd.read_csv(input_file, skiprows=6)
	data.columns = ["City", "Date", "Pageviews"]

	remove_this = numdays + 4 # 4 = total, extra space row, and header
	data = data[:-remove_this]

	data = data[data.City != "(not set)"] # remove (not set) rows

	# begin building dataframe for output
	outputDF = pd.DataFrame(columns = ["City", "Language"])



	# 1. Add in CITY names
	outputDF.Country = np.unique((data.City).tolist())


	# 2. Drop in PAGEVIEW totals
	#	Each date column has total pageviews per country up to and including that date. 
	#	If there are no pageviews for a particular country at a particular date, the value ought to be 0.
	alldates = np.unique(data.Date).tolist()
	for i in xrange( len(alldates) ):
	    
		# get date
		thedate = alldates[i]
		thedate_pvs = data[data.Date == thedate]

		# merge data
		main = pd.DataFrame(outputDF.City)
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

	outputDF = outputDF[13:] # get rid of random names/numbers


	# 3. MERGE with LAT/LONG data
	latlong = pd.read_csv(latlong_file)
	merged = latlong.merge(outputDF, on="City", how="inner")

	# output to csv
	merged.to_csv("new-data/totals-daily-city.csv", index=False)



if __name__ == '__main__':
	main()




