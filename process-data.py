import numpy as np
import scipy as sp
import pandas as pd

'''
PROCESS-DATA outputs five files: one with the complete set of data, and four files that are subdivisions
	of the first, and correspond to each of the panels in the visualization.

Required files:
 * country files containing the countries in each panel (see github.com/anitameh/BFInternationalPosts)
 * a directory titled new-data
'''

def makeCityCountryCol(data):
	'''
	MAKECITYCOUNTRYCOL combines city and country into one column for the final data set
	:param data: data frame containing City, Country, Lat, Long, Date, Pageviews

	:returns (city_country, data): city_country is the list of joined cities and countries; 
		data is the inputted data set with the city-country column
	:rtype: a tuple
	'''
    city = data['City'].values
    country = data['Country'].values
    lang = data['Language'].values
    city_country = []
    for i, ea_city in enumerate(city):
        # 0 = en, 1 = es, 2 = fr, 3 = pt, 4 = de
        if lang[i] == 'en':
            ea_cc = str(ea_city) + "-" + str(country[i]) + str(0)
            city_country.append(ea_cc)
        if lang[i] == 'es':
            ea_cc = str(ea_city) + "-" + str(country[i]) + str(1)
            city_country.append(ea_cc)
        if lang[i] == 'fr':
            ea_cc = str(ea_city) + "-" + str(country[i]) + str(2)
            city_country.append(ea_cc)
        if lang[i] == 'pt':
            ea_cc = str(ea_city) + "-" + str(country[i]) + str(3)
            city_country.append(ea_cc)
        if lang[i] == 'de':
            ea_cc = str(ea_city) + "-" + str(country[i]) + str(4)
            city_country.append(ea_cc)

    # add new column to original data
    data['CityCountry'] = city_country
    
    return (city_country, data)

def ccWithZero(city_list, lang_num):
	'''
	CCWITHZERO attaches a language number to each city in a given list
	:param city_list: list of cities for a particular language
	:param lang_num: number associated with a particular language;
					0=english, 1=spanish, 2=french, 3=portuguese, 4=german
	
	:return: updated city list
	:rtype: list
	'''
    return [ city+str(lang_num) for city in city_list ]


def prune(threshold, finalcol):
	'''
    PRUNE if the final total number of pages for a particular city-country combo is less than 
    the 'threshold', remove the corresponding city-country from the dataset
    :param threshold: 
    :param finalcol:

    :return: outputs a csv to the current directory
    :rtype: dataframe outputted to csv
    '''
    for i in xrange(4):
        pathname = 'new-data/panel' + str(i) + '-data.csv'
        data = pd.read_csv(pathname)

        col_of_interest = data[finalcol].values
        new_data = data.iloc[ np.where( col_of_interest >= threshold) ]
        print 'panel', str(i), 'new length =', len(new_data)
        new_pathname = 'new-data/panel' + str(i) + '-new-data.csv'
        new_data.to_csv(new_pathname, index=False)


# initialize global variables
'''
List of cities with (0, 0)-(LAT, LON):
  * Assuming Greece, Greece = Athens 
  * Ecuador, Ecuador = Quito
  * Jordan, Jordan = Amman 
  * Botswana, Botswana = Gaborone
  * Bermuda, Bermuda = Hamilton
  * Afghanistan, Afghanistan = Kabul
'''
missing_cities = np.array(['Cobb County-United States', 'Trinidad and Tobago-Trinidad and Tobago', 'Barcelona-Spain', 
                        'Villanova-United States', 'Greater London-United Kingdom', 'Greater Manchester-United Kingdom', 
                        'Greece-Greece', 'Hertfordshire-United Kingdom', 'Tyne and Wear-United Kingdom', 
                        'Warrington-United Kingdom', 'Ecuador-Ecuador', 'Lima-Peru', 
                        'Auckland-New Zealand', 'Jordan-Jordan', 'Botswana-Botswana', 'Bermuda-Bermuda', 
                        'Afghanistan-Afghanistan'])
missing_lat = [33.94, 10.67, 41.38, 40.04, 51.51, 53.47, 37.97, 51.9, 54.59, 53.39, 0.23, 12.04, 36.84, 31.93, 24.66, 32.29, 34.53]
missing_lon = [84.58, 61.52, 2.18, 75.34, 0.13, 2.23, 23.72, 0.2, 1.36, 2.60, 78.52, 77.02, 174.74, 35.93, 25.92, 64.78, 69.17]



def main():

	# read in the data - this is for the 31 Sentiments visual in the DataBlog post
	english_data0 = pd.read_csv('new-data/original-data2/International Visualization Post_9-feb to 16-feb.csv')
	english_data1 = pd.read_csv('new-data/original-data2/International Visualization Post_17-feb to 23-feb.csv')
	english_data2 = pd.read_csv('new-data/original-data2/International Visualization Post_24-feb to 2-mar.csv')

	spanish_data0 = pd.read_csv('new-data/original-data2/International Visualization Post_es_17-feb to 23-feb.csv')
	spanish_data1 = pd.read_csv('new-data/original-data2/International Visualization Post_24-feb to 2-mar.csv')

	french_data0 = pd.read_csv('new-data/original-data2/International Visualization Post_fr_9-feb to 16-feb.csv')
	french_data1 = pd.read_csv('new-data/original-data2/International Visualization Post_fr_17-feb to 23-feb.csv')
	french_data2 = pd.read_csv('new-data/original-data2/International Visualization Post_24-feb to 2-mar.csv')

	port_data0 = pd.read_csv('new-data/original-data2/International Visualization Post_pt_17-feb to 23-feb.csv')
	port_data1 = pd.read_csv('new-data/original-data2/International Visualization Post_pt_24-feb to 2-mar.csv')

	# combine all data into one giant df
	english_data = pd.concat([english_data0, english_data1, english_data2])
	spanish_data = pd.concat([spanish_data0, spanish_data1])
	french_data = pd.concat([french_data0, french_data1, french_data2])
	port_data = pd.concat([port_data0, port_data1])

	english_data['Language'] = 'en'
	spanish_data['Language'] = 'es'
	french_data['Language'] = 'fr'
	port_data['Language'] = 'pt'

	original_data = pd.concat([english_data, spanish_data, french_data, port_data])


	# add CityCountry column
	result = makeCityCountryCol(original_data)
	city_country = result[0]
	data = result[1]


	# handle (0, 0)-(LAT, LON) values
	zero_cities_en = ccWithZero(missing_cities, 0)
	zero_cities_es = ccWithZero(missing_cities, 1)
	zero_cities_fr = ccWithZero(missing_cities, 2)
	zero_cities_pt = ccWithZero(missing_cities, 3)
	zero_cities_de = ccWithZero(missing_cities, 4)

	zero_cities = np.concatenate( (zero_cities_en, zero_cities_es, zero_cities_fr, zero_cities_fr, zero_cities_pt) )
	zero_lat = missing_lat*5
	zero_lon = missing_lon*5

	for i in xrange(len(zero_cities)):
		rows = data.iloc[ np.where(data.CityCountry == zero_cities[i]) ]
		ind = np.array(rows.index)
		length_rows = len(rows)
		if length_rows != 0:
			data.loc[ind, 'Longitude'] = zero_lon[i]
			data.loc[ind, 'Latitude'] = zero_lat[i]


	# create list of latitudes and longitudes from given data
	LAT = []
	LON = []
	uniqueCities = np.unique(data.CityCountry)

	for i in xrange( len(uniqueCities) ):
		# track progress
		if (i%500 == 0):
			print 'i =', i
		ind = np.where(data.CityCountry == uniqueCities[i])[0][0]
		LAT.append( data.iloc[ind]['Latitude'] )
		LON.append( data.iloc[ind]['Longitude'] )


	# output data frame with aggregated pageviews
	outputDF = pd.DataFrame( columns=["CityCountry", "Latitude", "Longitude"] )
	outputDF.CityCountry = uniqueCities
	outputDF.Latitude = LAT
	outputDF.Longitude = LON

	# add in city and country columns
	cities = []
	countries = []

	for i in xrange( len(uniqueCities) ):
		title = (outputDF.iloc[i].CityCountry)
		loc = title.split("-")
		
		if len(loc) > 2:
			city_name = ""
			for j in xrange( len(loc)-1 ):
				city_name = city_name + loc[j]
			cities.append( city_name )
			country_name = loc[j+1]
			countries.append( country_name[:-1] )
		else:
			cities.append( loc[0] )
			country_name = loc[1]
			countries.append( country_name[:-1] )

	outputDF['city'] = cities
	outputDF['country'] = countries

	alldates = np.unique(data.Date)
	thecities = pd.DataFrame(outputDF.CityCountry)

	# insert 0-pageviews column
	day_minusone = alldates[0]-1
	outputDF[ day_minusone ] = 0
	outputDF[ 'Language'+str(day_minusone)] = ''

	# drop rolled-up pageview totals into data frame
	for i in xrange( len(alldates) ):
	    thedate = alldates[i] # current date
	    thelang = 'Language'+str(thedate) # the language at this date
	    thedate_pvs = data[data.Date == thedate] # pageviews for this date

	    # merge pageviews along CityCountry
	    merged = thecities.merge(thedate_pvs.drop_duplicates(cols="City"), on="CityCountry", how="outer")
	    
	    if (i == 0):
	        
	        # replace NA values with 0/en
	        merged.Pageviews = (merged.Pageviews).fillna(value=0)
	        merged.Language = (merged.Language).fillna(value='en')
	        
	    else:
	        
	        # replace NA values with 0
	        merged.Pageviews = (merged.Pageviews).fillna(value=0)
	        
	        # sum with previous year
	        prevdate = alldates[i-1]
	        pv_totals = merged.Pageviews + outputDF[prevdate]
	        merged['Pageviews'] = pv_totals
	        
	    outputDF[thedate] = merged.Pageviews
	    outputDF[thelang] = merged.Language

	# now handle languages
	lang_headers = outputDF.columns[6::2]
	for i in xrange(len(outputDF)):
		# track progress
		if (i%500 == 0):
			print 'i =', i
		# fill up
		for j, lh in enumerate(lang_headers[:-1]):
			curr_lang = outputDF.iloc[i][lh]
			next_lang = outputDF.iloc[i][lang_headers[j+1]]
			if ((str(curr_lang) != 'nan') and (str(next_lang) == 'nan')):
				outputDF.loc[i, lang_headers[j+1]] = curr_lang # next entry = current entry

	# output final DF before splitting for spot-checking
	final = outputDF
	final.to_csv('new-data/alldata.csv', index=False)

	# separate into four data files, one per panel
	countries = final.country

	north_am = pd.read_csv('new-data/country-list/north-america.csv', header=None)
	europe = pd.read_csv('new-data/country-list/europe.csv', header=None)
	south_am = pd.read_csv('new-data/country-list/south-america.csv', header=None)
	australasia = pd.read_csv('new-data/country-list/australasia.csv', header=None)

	# separate into four panels
	na_ind, e_ind, sa_ind, aus_ind = [], [], [], []

	for i, country in enumerate(countries):
	    if (country in north_am.values):
	        na_ind.append( i )
	    elif (country in europe.values):
	        e_ind.append( i )
	    elif (country in south_am.values):
	        sa_ind.append( i )
	    elif (country in australasia.values):
	        aus_ind.append( i )
	        
	panel0 = final.iloc[na_ind]
	panel1 = final.iloc[e_ind]
	panel2 = final.iloc[sa_ind]
	panel3 = final.iloc[aus_ind]

	# write to csv
	panel0.to_csv('new-data/panel0-data.csv', index=False)
	panel1.to_csv('new-data/panel1-data.csv', index=False)
	panel2.to_csv('new-data/panel2-data.csv', index=False)
	panel3.to_csv('new-data/panel3-data.csv', index=False)

	# prune data (adjust threshold)
	threshold=40
	finalcol='20140302'
	prune(threshold, finalcol)

        










