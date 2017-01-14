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
    "named_graph.json": {
      "@context": {
        "generatedAt": {
          "@id": "http://www.w3.org/ns/prov#generatedAtTime",
          "@type": "http://www.w3.org/2001/XMLSchema#date"
        },
        "Person": "http://xmlns.com/foaf/0.1/Person",
        "name": "http://xmlns.com/foaf/0.1/name",
        "knows": "http://xmlns.com/foaf/0.1/knows"
      },
      "@id": "http://example.org/graphs/73",
      "generatedAt": "2012-04-09",
      "@graph":
      [
        {
          "@id": "http://manu.sporny.org/about#manu",
          "@type": "Person",
          "name": "Manu Sporny",
          "knows": "http://greggkellogg.net/foaf#me"
        },
        {
          "@id": "http://greggkellogg.net/foaf#me",
          "@type": "Person",
          "name": "Gregg Kellogg",
          "knows": "http://manu.sporny.org/about#manu"
        }
      ]
    },
    "ontology.json": {
      "@context": {
          "as": "http://www.w3.org/ns/activitystreams#",
          "comment": "rdfs:comment",
          "creator": "dcterms:creator",
          "dc": "http://purl.org/dc/elements/1.1/",
          "dcterms": "http://purl.org/dc/terms/",
          "foaf": "http://xmlns.com/foaf/0.1/",
          "definedBy": {
              "@id": "rdfs:isDefinedBy",
              "@type": "@id"
          },
          "domain": {
              "@id": "rdfs:domain",
              "@type": "@id"
          },
          "id": "@id",
          "label": "rdfs:label",
          "modified": "dcterms:modified",
          "oa": "http://www.w3.org/ns/oa#",
          "owl": "http://www.w3.org/2002/07/owl#",
          "prov": "http://www.w3.org/ns/prov#",
          "previousVersion": {
              "@id": "prov:wasRevisionOf",
              "@type": "@id"
          },
          "range": {
              "@id": "rdfs:range",
              "@type": "@id"
          },
          "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
          "seeAlso": {
              "@id": "rdfs:seeAlso",
              "@type": "@id"
          },
          "subClassOf": {
              "@id": "rdfs:subClassOf",
              "@type": "@id"
          },
          "title": "dc:title",
          "type": "@type",
          "version": "owl:versionInfo",
          "xsd": "http://www.w3.org/2001/XMLSchema#"
      },
      "@graph": [
          {
              "comment": "DataPositionSelector describes a range of data by recording the start and end positions of the selection in the stream. Position 0 would be immediately before the first byte, position 1 would be immediately before the second byte, and so on. The start byte is thus included in the list, but the end byte is not.",
              "definedBy": "oa:",
              "id": "oa:DataPositionSelector",
              "label": "DataPositionSelector",
              "subClassOf": "oa:Selector",
              "type": "rdfs:Class"
          },
          {
              "comment": "The start timestamp of the interval over which the Source resource should be interpreted as being applicable to the Annotation.",
              "definedBy": "oa:",
              "domain": "oa:TimeState",
              "id": "oa:sourceDateStart",
              "label": "sourceDateStart",
              "range": "xsd:dateTime",
              "type": "rdf:Property"
          },
          {
              "comment": "The FragmentSelector class is used to record the segment of a representation using the IRI fragment specification defined by the representation's media type.",
              "definedBy": "oa:",
              "id": "oa:FragmentSelector",
              "label": "FragmentSelector",
              "subClassOf": "oa:Selector",
              "type": "rdfs:Class"
          },
          {
              "comment": "The Motivation class is used to record the user's intent or motivation for the creation of the Annotation, or the inclusion of the body or target, that it is associated with.",
              "definedBy": "oa:",
              "id": "oa:Motivation",
              "label": "Motivation",
              "subClassOf": "http://www.w3.org/2004/02/skos/core#Concept",
              "type": "rdfs:Class"
          },
          {
              "comment": "The motivation for when the user intends to assign an identity to the Target or identify what is being depicted or described in the Target.",
              "definedBy": "oa:",
              "id": "oa:identifying",
              "label": "identifying",
              "type": "oa:Motivation"
          },
          {
              "comment": "The timestamp at which the Source resource should be interpreted as being applicable to the Annotation.",
              "definedBy": "oa:",
              "domain": "oa:TimeState",
              "id": "oa:sourceDate",
              "label": "sourceDate",
              "range": "xsd:dateTime",
              "type": "rdf:Property"
          },
          {
              "comment": "The direction of text that is read from right to left.",
              "definedBy": "oa:",
              "id": "oa:rtlDirection",
              "label": "rtlDirection",
              "type": "oa:Direction"
          },
          {
              "comment": "A CssSelector describes a Segment of interest in a representation that conforms to the Document Object Model through the use of the CSS selector specification.",
              "definedBy": "oa:",
              "id": "oa:CssSelector",
              "label": "CssSelector",
              "subClassOf": "oa:Selector",
              "type": "rdfs:Class"
          },
          {
              "comment": "A resource which describes styles for resources participating in the Annotation using CSS.",
              "definedBy": "oa:",
              "id": "oa:CssStyle",
              "label": "CssStyle",
              "subClassOf": "oa:Style",
              "type": "rdfs:Class"
          },
          {
              "comment": "The HttpRequestState class is used to record the HTTP request headers that a client SHOULD use to request the correct representation from the resource. ",
              "definedBy": "oa:",
              "id": "oa:HttpRequestState",
              "label": "HttpRequestState",
              "subClassOf": "oa:State",
              "type": "rdfs:Class"
          },
          {
              "comment": "The direction of text that is read from left to right.",
              "definedBy": "oa:",
              "id": "oa:ltrDirection",
              "label": "ltrDirection",
              "type": "oa:Direction"
          },
          {
              "comment": "The motivation for when the user intends to comment about the Target.",
              "definedBy": "oa:",
              "id": "oa:commenting",
              "label": "commenting",
              "type": "oa:Motivation"
          },
          {
              "comment": "A class to encapsulate the different text directions that a textual resource might take.  It is not used directly in the Annotation Model, only its three instances.",
              "definedBy": "oa:",
              "id": "oa:Direction",
              "label": "Direction",
              "type": "rdfs:Class"
          },
          {
              "comment": "Instances of the ResourceSelection class identify part (described by an oa:Selector) of another resource (referenced with oa:hasSource), possibly from a particular representation of a resource (described by an oa:State). Please note that ResourceSelection is not used directly in the Web Annotation model, but is provided as a separate class for further application profiles to use, separate from oa:SpecificResource which has many Annotation specific features.",
              "definedBy": "oa:",
              "id": "oa:ResourceSelection",
              "label": "ResourceSelection",
              "type": "rdfs:Class"
          },
          {
              "comment": "The motivation for when the user intends to describe the Target, as opposed to a comment about them.",
              "definedBy": "oa:",
              "id": "oa:describing",
              "label": "describing",
              "type": "oa:Motivation"
          },
          {
              "comment": "An IRI to signal the client prefers to receive full descriptions of the Annotations from a container, not just their IRIs.",
              "definedBy": "oa:",
              "id": "oa:PreferContainedDescriptions",
              "label": "PreferContainedDescriptions",
              "type": "rdfs:Resource"
          },
          {
              "comment": "The start position in a 0-based index at which a range of content is selected from the data in the source resource.",
              "definedBy": "oa:",
              "id": "oa:start",
              "label": "start",
              "range": "xsd:nonNegativeInteger",
              "type": "rdf:Property"
          },
          {
              "comment": "The motivation for when the user intends to highlight the Target resource or segment of it.",
              "definedBy": "oa:",
              "id": "oa:highlighting",
              "label": "highlighting",
              "type": "oa:Motivation"
          },
          {
              "comment": "The relationship between an Annotation and a Motivation that describes the reason for the Annotation's creation.",
              "definedBy": "oa:",
              "domain": "oa:Annotation",
              "id": "oa:motivatedBy",
              "label": "motivatedBy",
              "range": "oa:Motivation",
              "type": "rdf:Property"
          },
          {
              "comment": "The object of the relationship is a Selector that describes the segment or region of interest within the source resource.  Please note that the domain ( oa:ResourceSelection ) is not used directly in the Web Annotation model.",
              "definedBy": "oa:",
              "domain": "oa:ResourceSelection",
              "id": "oa:hasSelector",
              "label": "hasSelector",
              "range": "oa:Selector",
              "type": "rdf:Property"
          },
          {
              "comment": "A object of the relationship is a copy of the Source resource's representation, appropriate for the Annotation.",
              "definedBy": "oa:",
              "domain": "oa:TimeState",
              "id": "oa:cachedSource",
              "label": "cachedSource",
              "type": "rdf:Property"
          },
          {
              "comment": "The name of the class used in the CSS description referenced from the Annotation that should be applied to the Specific Resource.",
              "definedBy": "oa:",
              "domain": "oa:SpecificResource",
              "id": "oa:styleClass",
              "label": "styleClass",
              "range": "xsd:string",
              "type": "rdf:Property"
          },
          {
              "comment": "The TextPositionSelector describes a range of text by recording the start and end positions of the selection in the stream. Position 0 would be immediately before the first character, position 1 would be immediately before the second character, and so on.",
              "definedBy": "oa:",
              "id": "oa:TextPositionSelector",
              "label": "TextPositionSelector",
              "subClassOf": "oa:Selector",
              "type": "rdfs:Class"
          },
          {
              "comment": "The snippet of text that occurs immediately after the text which is being selected.",
              "definedBy": "oa:",
              "id": "oa:suffix",
              "label": "suffix",
              "range": "xsd:string",
              "type": "rdf:Property"
          },
          {
              "comment": "A reference to a Stylesheet that should be used to apply styles to the Annotation rendering.",
              "definedBy": "oa:",
              "domain": "oa:Annotation",
              "id": "oa:styledBy",
              "label": "styledBy",
              "range": "oa:Style",
              "type": "rdf:Property"
          },
          {
              "comment": "The motivation for when the user intends to create a bookmark to the Target or part thereof.",
              "definedBy": "oa:",
              "id": "oa:bookmarking",
              "label": "bookmarking",
              "type": "oa:Motivation"
          },
          {
              "comment": "A State describes the intended state of a resource as applied to the particular Annotation, and thus provides the information needed to retrieve the correct representation of that resource.",
              "definedBy": "oa:",
              "id": "oa:State",
              "label": "State",
              "type": "rdfs:Class"
          },
          {
              "comment": "The direction of the text of the subject resource. There MUST only be one text direction associated with any given resource.",
              "definedBy": "oa:",
              "id": "oa:textDirection",
              "label": "textDirection",
              "range": "oa:Direction",
              "type": "rdf:Property"
          },
          {
              "comment": "The motivation for when the user intends to associate a tag with the Target.",
              "definedBy": "oa:",
              "id": "oa:tagging",
              "label": "tagging",
              "type": "oa:Motivation"
          },
          {
              "comment": "The relationship between the ResourceSelection, or its subclass SpecificResource, and a State resource. Please note that the domain ( oa:ResourceSelection ) is not used directly in the Web Annotation model.",
              "definedBy": "oa:",
              "domain": "oa:ResourceSelection",
              "id": "oa:hasState",
              "label": "hasState",
              "range": "oa:State",
              "type": "rdf:Property"
          },
          {
              "comment": "The scope or context in which the resource is used within the Annotation.",
              "definedBy": "oa:",
              "domain": "oa:SpecificResource",
              "id": "oa:hasScope",
              "label": "hasScope",
              "type": "rdf:Property"
          },
          {
              "comment": "A subClass of  as:OrderedCollection  that conveys to a consuming application that it should select one of the resources in the  as:items  list to use, rather than all of them.  This is typically used to provide a choice of resources to render to the user, based on further supplied properties.  If the consuming application cannot determine the user's preference, then it should use the first in the list.",
              "definedBy": "oa:",
              "id": "oa:Choice",
              "label": "Choice",
              "subClassOf": "as:OrderedCollection",
              "type": "rdfs:Class"
          },
          {
              "comment": "A Range Selector can be used to identify the beginning and the end of the selection by using other Selectors. The selection consists of everything from the beginning of the starting selector through to the beginning of the ending selector, but not including it.",
              "definedBy": "oa:",
              "id": "oa:RangeSelector",
              "label": "RangeSelector",
              "subClassOf": "oa:Selector",
              "type": "rdfs:Class"
          },
          {
              "comment": "A object of the relationship is a resource from which the source resource was retrieved by the providing system.",
              "definedBy": "oa:",
              "id": "oa:via",
              "label": "via",
              "type": "rdf:Property"
          },
          {
              "comment": "The object of the property is a snippet of content that occurs immediately before the content which is being selected by the Selector.",
              "definedBy": "oa:",
              "id": "oa:prefix",
              "label": "prefix",
              "range": "xsd:string",
              "type": "rdf:Property"
          },
          {
              "comment": "",
              "definedBy": "oa:",
              "id": "oa:TextualBody",
              "label": "TextualBody",
              "type": "rdfs:Class"
          },
          {
              "comment": "The object of the relationship is the end point of a service that conforms to the annotation-protocol, and it may be associated with any resource.  The expectation of asserting the relationship is that the object is the preferred service for maintaining annotations about the subject resource, according to the publisher of the relationship.\n   \n  This relationship is intended to be used both within Linked Data descriptions and as the  rel  type of a Link, via HTTP Link Headers rfc5988 for binary resources and in HTML <link> elements.  For more information about these, please see the Annotation Protocol specification annotation-protocol.\n  ",
              "definedBy": "oa:",
              "id": "oa:annotationService",
              "label": "annotationService",
              "type": "rdf:Property"
          },
          {
              "comment": "A object of the relationship is the canonical IRI that can always be used to deduplicate the Annotation, regardless of the current IRI used to access the representation.",
              "definedBy": "oa:",
              "id": "oa:canonical",
              "label": "canonical",
              "type": "rdf:Property"
          },
          {
              "comment": " An XPathSelector is used to select elements and content within a resource that supports the Document Object Model via a specified XPath value.",
              "definedBy": "oa:",
              "id": "oa:XPathSelector",
              "label": "XPathSelector",
              "subClassOf": "oa:Selector",
              "type": "rdfs:Class"
          },
          {
              "comment": "The TextQuoteSelector describes a range of text by copying it, and including some of the text immediately before (a prefix) and after (a suffix) it to distinguish between multiple copies of the same sequence of characters.",
              "definedBy": "oa:",
              "id": "oa:TextQuoteSelector",
              "label": "TextQuoteSelector",
              "subClassOf": "oa:Selector",
              "type": "rdfs:Class"
          },
          {
              "comment": "The object of the predicate is a plain text string to be used as the content of the body of the Annotation.  The value MUST be an  xsd:string  and that data type MUST NOT be expressed in the serialization. Note that language MUST NOT be associated with the value either as a language tag, as that is only available for  rdf:langString .\n  ",
              "definedBy": "oa:",
              "domain": "oa:Annotation",
              "id": "oa:bodyValue",
              "label": "bodyValue",
              "range": "xsd:string",
              "type": "rdf:Property"
          },
          {
              "comment": "The relationship between an Annotation and its Target.",
              "definedBy": "oa:",
              "domain": "oa:Annotation",
              "id": "oa:hasTarget",
              "label": "hasTarget",
              "type": "rdf:Property"
          },
          {
              "comment": "The motivation for when the user intends to link to a resource related to the Target.",
              "definedBy": "oa:",
              "id": "oa:linking",
              "label": "linking",
              "type": "oa:Motivation"
          },
          {
              "comment": "The motivation for when the user intends to request a change or edit to the Target resource.",
              "definedBy": "oa:",
              "id": "oa:editing",
              "label": "editing",
              "type": "oa:Motivation"
          },
          {
              "comment": "The resource that the ResourceSelection, or its subclass SpecificResource, is refined from, or more specific than. Please note that the domain ( oa:ResourceSelection ) is not used directly in the Web Annotation model.",
              "definedBy": "oa:",
              "domain": "oa:ResourceSelection",
              "id": "oa:hasSource",
              "label": "hasSource",
              "type": "rdf:Property"
          },
          {
              "comment": "A TimeState records the time at which the resource's state is appropriate for the Annotation, typically the time that the Annotation was created and/or a link to a persistent copy of the current version.",
              "definedBy": "oa:",
              "id": "oa:TimeState",
              "label": "TimeState",
              "subClassOf": "oa:State",
              "type": "rdfs:Class"
          },
          {
              "comment": "A system that was used by the application that created the Annotation to render the resource.",
              "definedBy": "oa:",
              "domain": "oa:SpecificResource",
              "id": "oa:renderedVia",
              "label": "renderedVia",
              "type": "rdf:Property"
          },
          {
              "comment": "The class for Web Annotations.",
              "definedBy": "oa:",
              "id": "oa:Annotation",
              "label": "Annotation",
              "type": "rdfs:Class"
          },
          {
              "comment": "A Style describes the intended styling of a resource as applied to the particular Annotation, and thus provides the information to ensure that rendering is consistent across implementations.",
              "definedBy": "oa:",
              "id": "oa:Style",
              "label": "Style",
              "type": "rdfs:Class"
          },
          {
              "comment": "The end timestamp of the interval over which the Source resource should be interpreted as being applicable to the Annotation.",
              "definedBy": "oa:",
              "domain": "oa:TimeState",
              "id": "oa:sourceDateEnd",
              "label": "sourceDateEnd",
              "range": "xsd:dateTime",
              "type": "rdf:Property"
          },
          {
              "comment": "The motivation for when the user intends to assign some value or quality to the Target.",
              "definedBy": "oa:",
              "id": "oa:moderating",
              "label": "moderating",
              "type": "oa:Motivation"
          },
          {
              "comment": "The relationship between a RangeSelector and the Selector that describes the end position of the range. ",
              "definedBy": "oa:",
              "domain": "oa:RangeSelector",
              "id": "oa:hasEndSelector",
              "label": "hasEndSelector",
              "range": "oa:Selector",
              "type": "rdf:Property"
          },
          {
              "comment": "The object of the predicate is a copy of the text which is being selected, after normalization.",
              "definedBy": "oa:",
              "id": "oa:exact",
              "label": "exact",
              "range": "xsd:string",
              "type": "rdf:Property"
          },
          {
              "comment": "The object of the relationship is a resource that is a body of the Annotation.",
              "definedBy": "oa:",
              "domain": "oa:Annotation",
              "id": "oa:hasBody",
              "label": "hasBody",
              "type": "rdf:Property"
          },
          {
              "comment": "An SvgSelector defines an area through the use of the Scalable Vector Graphics [SVG] standard. This allows the user to select a non-rectangular area of the content, such as a circle or polygon by describing the region using SVG. The SVG may be either embedded within the Annotation or referenced as an External Resource.",
              "definedBy": "oa:",
              "id": "oa:SvgSelector",
              "label": "SvgSelector",
              "subClassOf": "oa:Selector",
              "type": "rdfs:Class"
          },
          {
              "comment": "The motivation for when the user intends to that classify the Target as something.",
              "definedBy": "oa:",
              "id": "oa:classifying",
              "label": "classifying",
              "type": "oa:Motivation"
          },
          {
              "comment": "The relationship between a Selector and another Selector or a State and a Selector or State that should be applied to the results of the first to refine the processing of the source resource. ",
              "definedBy": "oa:",
              "id": "oa:refinedBy",
              "label": "refinedBy",
              "type": "rdf:Property"
          },
          {
              "comment": "The purpose served by the resource in the Annotation.",
              "definedBy": "oa:",
              "id": "oa:hasPurpose",
              "label": "hasPurpose",
              "range": "oa:Motivation",
              "type": "rdf:Property"
          },
          {
              "comment": "The Web Annotation ontology defines the terms of the Web Annotation vocabulary. Any changes to this document MUST be from a Working Group in the W3C that has established expertise in the area.",
              "creator": [
                  {"@type": "foaf:Person", "foaf:name": "Paolo Ciccarese"},
                  {"@type": "foaf:Person", "foaf:name": "Benjamin Young"},
                  {"@type": "foaf:Person", "foaf:name": "Robert Sanderson"}
              ],
              "id": "oa:",
              "modified": "2016-11-12T21:28:11Z",
              "previousVersion": "http://www.openannotation.org/spec/core/20130208/oa.owl",
              "seeAlso": "http://www.w3.org/TR/annotation-vocab/",
              "title": "Web Annotation Ontology",
              "type": "owl:Ontology",
              "version": "2016-11-12T21:28:11Z"
          },
          {
              "comment": "The motivation for when the user intends to provide an assessment about the Target resource.",
              "definedBy": "oa:",
              "id": "oa:assessing",
              "label": "assessing",
              "type": "oa:Motivation"
          },
          {
              "comment": "The relationship between a RangeSelector and the Selector that describes the start position of the range. ",
              "definedBy": "oa:",
              "domain": "oa:RangeSelector",
              "id": "oa:hasStartSelector",
              "label": "hasStartSelector",
              "range": "oa:Selector",
              "type": "rdf:Property"
          },
          {
              "comment": "The motivation for when the user intends to reply to a previous statement, either an Annotation or another resource.",
              "definedBy": "oa:",
              "id": "oa:replying",
              "label": "replying",
              "type": "oa:Motivation"
          },
          {
              "comment": "The object of the property is the language that should be used for textual processing algorithms when dealing with the content of the resource, including hyphenation, line breaking, which font to use for rendering and so forth.  The value must follow the recommendations of BCP47.",
              "definedBy": "oa:",
              "id": "oa:processingLanguage",
              "label": "processingLanguage",
              "range": "xsd:string",
              "type": "rdf:Property"
          },
          {
              "comment": "The motivation for when the user intends to ask a question about the Target.",
              "definedBy": "oa:",
              "id": "oa:questioning",
              "label": "questioning",
              "type": "oa:Motivation"
          },
          {
              "comment": "The end property is used to convey the 0-based index of the end position of a range of content.",
              "definedBy": "oa:",
              "id": "oa:end",
              "label": "end",
              "range": "xsd:nonNegativeInteger",
              "type": "rdf:Property"
          },
          {
              "comment": "An IRI to signal that the client prefers to receive only the IRIs of the Annotations from a container, not their full descriptions.",
              "definedBy": "oa:",
              "id": "oa:PreferContainedIRIs",
              "label": "PreferContainedIRIs",
              "type": "rdfs:Resource"
          },
          {
              "comment": "Instances of the SpecificResource class identify part of another resource (referenced with oa:hasSource), a particular representation of a resource, a resource with styling hints for renders, or any combination of these, as used within an Annotation.",
              "definedBy": "oa:",
              "id": "oa:SpecificResource",
              "label": "SpecificResource",
              "subClassOf": "oa:ResourceSelection",
              "type": "rdfs:Class"
          },
          {
              "comment": "A resource which describes the segment of interest in a representation of a Source resource, indicated with oa:hasSelector from the Specific Resource. This class is not used directly in the Annotation model, only its subclasses.",
              "definedBy": "oa:",
              "id": "oa:Selector",
              "label": "Selector",
              "type": "rdfs:Class"
          }
      ]
  }
  };
  return fixtures[name];
};


module.exports.getFixture = getFixture;
module.exports.getDB = getDB;
