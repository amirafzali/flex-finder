import sys
import firebase_admin
from firebase_admin import credentials, firestore

# REFER TO: https://towardsdatascience.com/nosql-on-the-cloud-with-python-55a1383752fc
# https://cloud.google.com/firestore/docs/samples/firestore-data-set-id-random-collection
# collection is like a "database" whereas document is like a table
# # or data instance(JSON Object found in a given collection.
# We will have a collection for search and profile
# May need to make collection of collection and then create documents for them rather than doing nested JSON/documents ina given document.
#   -> this makes it easier to query, but could also do normal set checks.

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# CONNECT TO FIRESTORE INSTANCE
db = firestore.client()  # this connects to our Firestore database
collection = db.collection('places')  # opens 'places' collection
doc = collection.document('rome').collection('anando').document('gyms')  # specifies the 'rome' document

res = collection.document('rome').set({
    'lat': 41.9028, 'long': 12.4964,
    'where_to_go': [
        'villa_borghese',
        'trastevere',
        'vatican_city'
    ]
})

# READ DATA
res = doc.get().to_dict()
print(res)
print(doc.id) # retrieves doc id

# CREATE documents for a given collection.
res = collection.document('barcelona').set({
    'lat': 41.3851, 'long': 2.1734,
    'weather': 'great',
    'landmarks': {
        'park':'guadí park',
        'chruch':'gaudí church',
        'else':'gaudí everything'
    }
})

doc = collection.document('barcelona')
res = doc.get().to_dict()
print(res)

# CREATE A DOCUMENT WITH AUTOGENERATED ID(ADD keyword) - similar to push in normal realtime db
res = collection.add({
    'lat': 51.3851, 'long': 5.1734,
    'weather': 'great',
    'landmarks': {
        'park':'anando park',
        'chruch':'zaman church',
        'else':'anando-zaman everything'
    }
})
print("AUTOGENERATE SHIT:\n")
print(res[-1].id) # AUTOGENRETAED ID

# UPDATE/MODIFY DOCUMENT DATA from a collection
res = collection.document('barcelona').update({
    'weather': 'sun'
})
res = collection.document('barcelona').get().to_dict()
print(res)

# UPDATING SINGLE INDIVIDUAL ARRAY VALUES(ADD/REMOVE)
# ADD
collection.document('rome').update({
    'where_to_go': firestore.ArrayUnion(['colosseum'])
})
res = collection.document('rome').get().to_dict()
print(res)

# REMOVE
collection.document('rome').update({
    'where_to_go': firestore.ArrayRemove(['colosseum'])
})
res = collection.document('rome').get().to_dict()
print(res)




# DELETE ENTIRE DOCUMENT(like deleting entire table)
collection.document('rome').delete()
res = collection.document('rome').get().to_dict()
print(res)
# DELETE single field within document(like deleting a column from a table)
collection.document('barcelona').update({
    'weather': firestore.DELETE_FIELD})
res = collection.document('barcelona').get().to_dict()
print(res) # output should now not have weather field



# QUERY FIRESTORE - queries against all documents in a given collection
# https://cloud.google.com/firestore/docs/query-data/queries#python
# To query our Firestore, we use the where method on our collection object.
# The method has three arguments, where(fieldPath, opStr, value):
# fieldPath — the field we are targeting, in this case 'long'
# opStr — comparison operation string, '==' checks equality
# value — the value we are comparing to
print(collection.document('barcelona').where('long', '>', 9.4989).get())
# If we want to check nested documents, then we can do that manually using for loops.

# COMPOUND QUERY , basically logical AND
# denver_query = cities_ref.where(u'state', u'==', u'CO').where(u'name', u'==', u'Denver')




'''
# pip install google-cloud-firestore

from Firebase.firebase_api import firebase_class
from Profile.Profile import Profile
from Scheduler.Scheduler import *
from Search.Search import *
import re



firebase = firebase_class()
# Get database instance
db = firebase.get_db()

school = "McMaster"
workout_type = "cardio"
gym = "DBAC"
timeslots_available = [(1,2),(12,14)]

print(db.child("Search").child("Type").get().val())
#search_by_school_type_gym(db, school, workout_type, gym, timeslots_available)
'''