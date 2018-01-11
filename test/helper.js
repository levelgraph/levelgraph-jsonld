var fs       = require('fs'),
    level    = require('memdb'),
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
    },
    "chapter.json": {
      "@context": {
        "dc": "http://purl.org/dc/elements/1.1/",
        "ex": "http://example.org/vocab#"
      },
      "@id": "http://example.org/library/the-republic#introduction",
      "@type": "ex:Chapter",
      "dc:title": "The Introduction"
    },
    "chapterdescription.json": {
      "@context": {
        "dc": "http://purl.org/dc/elements/1.1/",
        "ex": "http://example.org/vocab#"
      },
      "@id": "http://example.org/library/the-republic#introduction",
      "dc:description": "An introductory chapter on The Republic."
    },
    "library_framed.json": {
      "@context": {
        "dc": "http://purl.org/dc/elements/1.1/",
        "ex": "http://example.org/vocab#",
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "ex:contains": {
          "@type": "@id"
        }
      },
      "@id": "http://example.org/library",
      "@type": "ex:Library",
      "ex:contains": {
        "@id": "http://example.org/library/the-republic",
        "@type": "ex:Book",
        "ex:contains": {
          "@id": "http://example.org/library/the-republic#introduction",
          "@type": "ex:Chapter",
          "dc:description": "An introductory chapter on The Republic.",
          "dc:title": "The Introduction"
        },
        "dc:creator": "Plato",
        "dc:title": "The Republic"
      }
    },
    "library.json": {
      "@context": {
        "dc": "http://purl.org/dc/elements/1.1/",
        "ex": "http://example.org/vocab#",
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "ex:contains": {
          "@type": "@id"
        }
      },
      "@graph": [
        {
          "@id": "http://example.org/library",
          "@type": "ex:Library",
          "ex:contains": "http://example.org/library/the-republic"
        },
        {
          "@id": "http://example.org/library/the-republic",
          "@type": "ex:Book",
          "dc:creator": "Plato",
          "dc:title": "The Republic",
          "ex:contains": "http://example.org/library/the-republic#introduction"
        },
        {
          "@id": "http://example.org/library/the-republic#introduction",
          "@type": "ex:Chapter",
          "dc:description": "An introductory chapter on The Republic.",
          "dc:title": "The Introduction"
        }
      ]
    },
    "mapped_id.json": {
      "@context": {
        "id": "@id",
        "@vocab": "http://xmlns.com/foaf/0.1/"
      },
      "id": "http://bigbluehat.com/#",
      "name": "BigBlueHat",
      "knows": [
        {
          "id": "http://manu.sporny.org#person",
          "name": "Manu Sporny",
          "homepage": "http://manu.sporny.org/"
        }
      ]
    },
    "annotation_remote.json": {
      "@context": "http://www.w3.org/ns/anno.jsonld",
      "id": "http://example.org/anno9",
      "type": "Annotation",
      "body": [
        "http://example.org/description1",
        {
          "type": "TextualBody",
          "value": "tag1"
        }
      ],
      "target": [
        "http://example.org/image1",
        "http://example.org/image2",
        {
          "source": "http://example.org/"
        }
      ]
    },
    "list.json": {
      "@id": "https://example.org/doc",
      "https://example.org/list": { "@list": [ { "https://example.org/item": "one" }, { "https://example.org/item": "two" } ] }
    },
    "listcontext.json": {
      "@id": "https://example.org/doc",
      "@context": {
        "https://example.org/list": { "@container": "@list" }
      },
      "https://example.org/list": [ { "https://example.org/item": "one" }, { "https://example.org/item": "two" } ]
    },
    "annotation.json": {
      "@context": {
        "oa":      "http://www.w3.org/ns/oa#",
        "dc":      "http://purl.org/dc/elements/1.1/",
        "dcterms": "http://purl.org/dc/terms/",
        "dctypes": "http://purl.org/dc/dcmitype/",
        "foaf":    "http://xmlns.com/foaf/0.1/",
        "rdf":     "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs":    "http://www.w3.org/2000/01/rdf-schema#",
        "skos":    "http://www.w3.org/2004/02/skos/core#",
        "xsd":     "http://www.w3.org/2001/XMLSchema#",
        "iana":    "http://www.iana.org/assignments/relation/",
        "owl":     "http://www.w3.org/2002/07/owl#",
        "as":      "http://www.w3.org/ns/activitystreams#",
        "schema":  "http://schema.org/",

        "id":      {"@type": "@id", "@id": "@id"},
        "type":    {"@type": "@id", "@id": "@type"},

        "Annotation":           "oa:Annotation",
        "Dataset":              "dctypes:Dataset",
        "Image":                "dctypes:StillImage",
        "Video":                "dctypes:MovingImage",
        "Audio":                "dctypes:Sound",
        "Text":                 "dctypes:Text",
        "TextualBody":          "oa:TextualBody",
        "ResourceSelection":    "oa:ResourceSelection",
        "SpecificResource":     "oa:SpecificResource",
        "FragmentSelector":     "oa:FragmentSelector",
        "CssSelector":          "oa:CssSelector",
        "XPathSelector":        "oa:XPathSelector",
        "TextQuoteSelector":    "oa:TextQuoteSelector",
        "TextPositionSelector": "oa:TextPositionSelector",
        "DataPositionSelector": "oa:DataPositionSelector",
        "SvgSelector":          "oa:SvgSelector",
        "RangeSelector":        "oa:RangeSelector",
        "TimeState":            "oa:TimeState",
        "HttpRequestState":     "oa:HttpRequestState",
        "CssStylesheet":        "oa:CssStyle",
        "Choice":               "oa:Choice",
        "Person":               "foaf:Person",
        "Software":             "as:Application",
        "Organization":         "foaf:Organization",
        "AnnotationCollection": "as:OrderedCollection",
        "AnnotationPage":       "as:OrderedCollectionPage",
        "Audience":             "schema:Audience",

        "Motivation":    "oa:Motivation",
        "bookmarking":   "oa:bookmarking",
        "classifying":   "oa:classifying",
        "commenting":    "oa:commenting",
        "describing":    "oa:describing",
        "editing":       "oa:editing",
        "highlighting":  "oa:highlighting",
        "identifying":   "oa:identifying",
        "linking":       "oa:linking",
        "moderating":    "oa:moderating",
        "questioning":   "oa:questioning",
        "replying":      "oa:replying",
        "reviewing":     "oa:reviewing",
        "tagging":       "oa:tagging",

        "auto":          "oa:autoDirection",
        "ltr":           "oa:ltrDirection",
        "rtl":           "oa:rtlDirection",

        "body":          {"@type": "@id", "@id": "oa:hasBody"},
        "target":        {"@type": "@id", "@id": "oa:hasTarget"},
        "source":        {"@type": "@id", "@id": "oa:hasSource"},
        "selector":      {"@type": "@id", "@id": "oa:hasSelector"},
        "state":         {"@type": "@id", "@id": "oa:hasState"},
        "scope":         {"@type": "@id", "@id": "oa:hasScope"},
        "refinedBy":     {"@type": "@id", "@id": "oa:refinedBy"},
        "startSelector": {"@type": "@id", "@id": "oa:hasStartSelector"},
        "endSelector":   {"@type": "@id", "@id": "oa:hasEndSelector"},
        "renderedVia":   {"@type": "@id", "@id": "oa:renderedVia"},
        "creator":       {"@type": "@id", "@id": "dcterms:creator"},
        "generator":     {"@type": "@id", "@id": "as:generator"},
        "rights":        {"@type": "@id", "@id": "dcterms:rights"},
        "homepage":      {"@type": "@id", "@id": "foaf:homepage"},
        "via":           {"@type": "@id", "@id": "oa:via"},
        "canonical":     {"@type": "@id", "@id": "oa:canonical"},
        "stylesheet":    {"@type": "@id", "@id": "oa:styledBy"},
        "cached":        {"@type": "@id", "@id": "oa:cachedSource"},
        "conformsTo":    {"@type": "@id", "@id": "dcterms:conformsTo"},
        "items":         {"@type": "@id", "@id": "as:items", "@container": "@list"},
        "partOf":        {"@type": "@id", "@id": "as:partOf"},
        "first":         {"@type": "@id", "@id": "as:first"},
        "last":          {"@type": "@id", "@id": "as:last"},
        "next":          {"@type": "@id", "@id": "as:next"},
        "prev":          {"@type": "@id", "@id": "as:prev"},
        "audience":      {"@type": "@id", "@id": "schema:audience"},
        "motivation":    {"@type": "@vocab", "@id": "oa:motivatedBy"},
        "purpose":       {"@type": "@vocab", "@id": "oa:hasPurpose"},
        "textDirection": {"@type": "@vocab", "@id": "oa:textDirection"},

        "accessibility": "schema:accessibilityFeature",
        "bodyValue":     "oa:bodyValue",
        "format":        "dc:format",
        "language":      "dc:language",
        "processingLanguage": "oa:processingLanguage",
        "value":         "rdf:value",
        "exact":         "oa:exact",
        "prefix":        "oa:prefix",
        "suffix":        "oa:suffix",
        "styleClass":    "oa:styleClass",
        "name":          "foaf:name",
        "email":         "foaf:mbox",
        "email_sha1":    "foaf:mbox_sha1sum",
        "nickname":      "foaf:nick",
        "label":         "rdfs:label",

        "created":       {"@id": "dcterms:created", "@type": "xsd:dateTime"},
        "modified":      {"@id": "dcterms:modified", "@type": "xsd:dateTime"},
        "generated":     {"@id": "dcterms:issued", "@type": "xsd:dateTime"},
        "sourceDate":    {"@id": "oa:sourceDate", "@type": "xsd:dateTime"},
        "sourceDateStart": {"@id": "oa:sourceDateStart", "@type": "xsd:dateTime"},
        "sourceDateEnd": {"@id": "oa:sourceDateEnd", "@type": "xsd:dateTime"},

        "start":         {"@id": "oa:start", "@type": "xsd:nonNegativeInteger"},
        "end":           {"@id": "oa:end", "@type": "xsd:nonNegativeInteger"},
        "total":         {"@id": "as:totalItems", "@type": "xsd:nonNegativeInteger"},
        "startIndex":    {"@id": "as:startIndex", "@type": "xsd:nonNegativeInteger"}
      },
      "id": "http://example.org/anno9",
      "type": "Annotation",
      "body": [
        "http://example.org/description1",
        {
          "type": "TextualBody",
          "value": "tag1"
        }
      ],
      "target": [
        "http://example.org/image1",
        "http://example.org/image2",
        {
          "source": "http://example.org/"
        }
      ]
    }
  };
  return fixtures[name];
};


module.exports.getFixture = getFixture;
module.exports.getDB = getDB;
