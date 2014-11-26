var fs       = require('fs'),
    level    = require('level-test')(),
    graph    = require('levelgraph'),
    jsonld   = require('../'),
    _        = require('lodash');

var getDB = function(opts) {
  opts = _.assign({ jsonld: {} }, opts);
  return jsonld(graph(level()), opts.jsonld);
};

var getFixture = function(name) {
  var fixtures = {
    "bigbuckbunny.json": {
      "@context": {
        "@vocab": "http://schema.org/"
      },
      "@id": "http://www.bigbuckbunny.org/",
      "name": "Big Buck Bunny"
    },
    "john.json": {
      "@context": "http://json-ld.org/contexts/person.jsonld",
      "@id": "http://dbpedia.org/resource/John_Lennon",
      "name": "John Lennon",
      "born": "1940-10-09",
      "spouse": "http://dbpedia.org/resource/Cynthia_Lennon"
    },
    "manu.json": {
      "@context": {
        "@vocab": "http://xmlns.com/foaf/0.1/",
        "homepage": { "@type": "@id" }
      },
      "@id": "http://manu.sporny.org#person",
      "name": "Manu Sporny",
      "homepage": "http://manu.sporny.org/"
    },
    "nested.json": {
      "@context": {
        "name": "http://xmlns.com/foaf/0.1/name",
        "knows": "http://xmlns.com/foaf/0.1/knows"
      },
      "@id": "http://matteocollina.com",
      "name": "matteo",
      "knows": [{
        "name": "daniele"
      }, {
        "name": "lucio"
      }]
    },
    "person.json": {
      "@context": {
        "Person": "http://xmlns.com/foaf/0.1/Person",
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "name": "http://xmlns.com/foaf/0.1/name",
        "nickname": "http://xmlns.com/foaf/0.1/nick",
        "affiliation": "http://schema.org/affiliation",
        "depiction": {
          "@id": "http://xmlns.com/foaf/0.1/depiction",
          "@type": "@id"
        },
        "image": {
          "@id": "http://xmlns.com/foaf/0.1/img",
          "@type": "@id"
        },
        "born": {
          "@id": "http://schema.org/birthDate",
          "@type": "xsd:dateTime"
        },
        "child": {
          "@id": "http://schema.org/children",
          "@type": "@id"
        },
        "colleague": {
          "@id": "http://schema.org/colleagues",
          "@type": "@id"
        },
        "knows": {
          "@id": "http://xmlns.com/foaf/0.1/knows",
          "@type": "@id"
        },
        "died": {
          "@id": "http://schema.org/deathDate",
          "@type": "xsd:dateTime"
        },
        "email": {
          "@id": "http://xmlns.com/foaf/0.1/mbox",
          "@type": "@id"
        },
        "familyName": "http://xmlns.com/foaf/0.1/familyName",
        "givenName": "http://xmlns.com/foaf/0.1/givenName",
        "gender": "http://schema.org/gender",
        "homepage": {
          "@id": "http://xmlns.com/foaf/0.1/homepage",
          "@type": "@id"
        },
        "honorificPrefix": "http://schema.org/honorificPrefix",
        "honorificSuffix": "http://schema.org/honorificSuffix",
        "jobTitle": "http://xmlns.com/foaf/0.1/title",
        "nationality": "http://schema.org/nationality",
        "parent": {
          "@id": "http://schema.org/parent",
          "@type": "@id"
        },
        "sibling": {
          "@id": "http://schema.org/sibling",
          "@type": "@id"
        },
        "spouse": {
          "@id": "http://schema.org/spouse",
          "@type": "@id"
        },
        "telephone": "http://schema.org/telephone",
        "Address": "http://www.w3.org/2006/vcard/ns#Address",
        "address": "http://www.w3.org/2006/vcard/ns#address",
        "street": "http://www.w3.org/2006/vcard/ns#street-address",
        "locality": "http://www.w3.org/2006/vcard/ns#locality",
        "region": "http://www.w3.org/2006/vcard/ns#region",
        "country": "http://www.w3.org/2006/vcard/ns#country",
        "postalCode": "http://www.w3.org/2006/vcard/ns#postal-code"
      }
    },
    "tesla.json": {
      "@context": {
        "gr": "http://purl.org/goodrelations/v1#",
        "pto": "http://www.productontology.org/id/",
        "foaf": "http://xmlns.com/foaf/0.1/",
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "foaf:page": {
          "@type": "@id"
        },
        "gr:acceptedPaymentMethods": {
          "@type": "@id"
        },
        "gr:hasBusinessFunction": {
          "@type": "@id"
        }
      },
      "@id": "http://example.org/cars/for-sale#tesla",
      "@type": "gr:Offering",
      "gr:name": "Used Tesla Roadster",
      "gr:description": "Need to sell fast and furiously",
      "gr:hasBusinessFunction": "gr:Sell",
      "gr:acceptedPaymentMethods": "gr:Cash",
      "gr:hasPriceSpecification": {
        "gr:hasCurrencyValue": "85000",
        "gr:hasCurrency": "USD"
      },
      "gr:includes": {
        "@type": ["gr:Individual", "pto:Vehicle"],
        "gr:name": "Tesla Roadster",
        "foaf:page": "http://www.teslamotors.com/roadster"
      }
    },
    "ratatat.json": {
      "@id": "http://dbpedia.org/resource/Ratatat",
      "@type" : [
        "http://dbpedia.org/class/yago/Measure100033615" ,
        "http://dbpedia.org/ontology/Band" ,
        "http://dbpedia.org/ontology/Agent" ,
        "http://dbpedia.org/class/yago/Digit113741022" ,
        "http://dbpedia.org/ontology/Organisation" ,
        "http://dbpedia.org/class/yago/AmericanHouseMusicGroups" ,
        "http://dbpedia.org/class/yago/Onomatopoeia107104574" ,
        "http://dbpedia.org/class/yago/Number113582013" ,
        "http://dbpedia.org/class/yago/Couple113743605" ,
        "http://dbpedia.org/class/yago/Two113743269" ,
        "http://schema.org/Organization" ,
        "http://dbpedia.org/class/yago/DefiniteQuantity113576101" ,
        "http://dbpedia.org/class/yago/Integer113728499" ,
        "http://dbpedia.org/class/yago/ExpressiveStyle107066659" ,
        "http://schema.org/MusicGroup" ,
        "http://dbpedia.org/class/yago/Group100031264" ,
        "http://www.w3.org/2002/07/owl#Thing" ,
        "http://dbpedia.org/class/yago/AmericanPost-rockGroups" ,
        "http://dbpedia.org/class/yago/Communication100033020" ,
        "http://dbpedia.org/class/yago/ElectronicMusicGroupsFromNewYork" ,
        "http://dbpedia.org/class/yago/ElectronicMusicDuos" ,
        "http://dbpedia.org/class/yago/Onomatopoeias" ,
        "http://dbpedia.org/class/yago/Abstraction100002137" ,
        "http://dbpedia.org/class/yago/Device107068844" ,
        "http://dbpedia.org/class/yago/RhetoricalDevice107098193" 
      ]
    }

  };
  return fixtures[name];
};


module.exports.getFixture = getFixture;
module.exports.getDB = getDB;
