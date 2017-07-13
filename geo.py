# import dstk

def csv_writer(data, path):
#     """
#     Write data to a CSV file path
#     """
#     lol = 1
    with open(path, "w") as csv_file:
        writer = csv.writer(csv_file, delimiter=',')
#         for line in data:
#             writer.writerow(line)
        for line in data:
#             print(line)
#             lol = lol + 1
#             if lol > 1:

            address = line[4] + ", San Francisco, CA"
            location = geolocator.geocode(address)
                
            if location != None:
                latitude = location.latitude
                longitude = location.longitude
                line[19] = longitude
                line[20] = latitude

            writer.writerow(line)
            
            final.close()
            
with open('/Users/matt/Sites/mattrusso.github.io/data/testData.csv', 'rt') as csvfile:
    data = csv.reader(csvfile)
    path = "newOutput3.csv"
    csv_writer(data, path)
