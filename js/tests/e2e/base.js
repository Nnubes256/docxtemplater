"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var PizZip = require("pizzip");
var _require = require("lodash"),
  assign = _require.assign;
var angularParser = require("../../expressions.js");
var angularParserIE11 = require("../../expressions-ie11.js");
var Docxtemplater = require("../../docxtemplater.js");
var _require2 = require("../../utils.js"),
  last = _require2.last;
var _require3 = require("../utils.js"),
  createDoc = _require3.createDoc,
  createDocV4 = _require3.createDocV4,
  createXmlTemplaterDocx = _require3.createXmlTemplaterDocx,
  expect = _require3.expect,
  expectToThrowSnapshot = _require3.expectToThrowSnapshot,
  getContent = _require3.getContent,
  getLength = _require3.getLength,
  getZip = _require3.getZip;
var inspectModule = require("../../inspect-module.js");
describe("Loading", function () {
  describe("ajax done correctly", function () {
    it("doc and img Data should have the expected length", function () {
      var doc = createDoc("tag-example.docx");
      expect(getLength(doc.loadedContent)).to.be.equal(19424);
    });
    it("should have the right number of files (the docx unzipped)", function () {
      var doc = createDoc("tag-example.docx");
      expect(Object.keys(doc.zip.files).length).to.be.equal(16);
    });
  });
  describe("basic loading", function () {
    it("should load file tag-example.docx", function () {
      var doc = createDoc("tag-example.docx");
      expect(_typeof(doc)).to.be.equal("object");
    });
  });
  describe("output and input", function () {
    it("should be the same", function () {
      var zip = new PizZip(createDoc("tag-example.docx").loadedContent);
      var doc = new Docxtemplater().loadZip(zip);
      var output = doc.getZip().generate({
        type: "base64"
      });
      expect(output.length).to.be.equal(90732);
      expect(output.substr(0, 50)).to.be.equal("UEsDBAoAAAAAAAAAIQAMTxYSlgcAAJYHAAATAAAAW0NvbnRlbn");
    });
  });
});
describe("Retrieving text content", function () {
  it("should work for the footer", function () {
    var doc = createDoc("tag-example.docx");
    var fullText = doc.getFullText("word/footer1.xml");
    expect(fullText.length).not.to.be.equal(0);
    expect(fullText).to.be.equal("{last_name}{first_name}{phone}");
  });
  it("should work for the document", function () {
    var doc = createDoc("tag-example.docx");
    var fullText = doc.getFullText();
    expect(fullText).to.be.equal("{last_name} {first_name}");
  });
});
describe("Retrieving list of templated files", function () {
  it("should return 6 templatedFiles for a simple document", function () {
    var doc = createDoc("tag-example.docx");
    var templatedFiles = doc.getTemplatedFiles();
    expect(templatedFiles).to.be.eql(["word/settings.xml", "docProps/core.xml", "docProps/app.xml", "word/header1.xml", "word/document.xml", "word/footer1.xml", "word/footnotes.xml"]);
  });
});
describe("Api versioning", function () {
  it("should work with valid numbers", function () {
    var doc = createDoc("tag-example.docx");
    expect(doc.verifyApiVersion("3.6.0")).to.be.equal(true);
    expect(doc.verifyApiVersion("3.5.0")).to.be.equal(true);
    expect(doc.verifyApiVersion("3.4.2")).to.be.equal(true);
    expect(doc.verifyApiVersion("3.4.22")).to.be.equal(true);
  });
  it("should fail with invalid versions", function () {
    var doc = createDoc("tag-example.docx");
    expectToThrowSnapshot(doc.verifyApiVersion.bind(null, "5.0"));
    expectToThrowSnapshot(doc.verifyApiVersion.bind(null, "5.6.0"));
    expectToThrowSnapshot(doc.verifyApiVersion.bind(null, "3.44.0"));
    expectToThrowSnapshot(doc.verifyApiVersion.bind(null, "3.39.100"));
  });
});
describe("Inspect module", function () {
  it("should get main tags", function () {
    var doc = createDoc("tag-loop-example.docx");
    var iModule = inspectModule();
    doc.attachModule(iModule);
    doc.compile();
    expect(iModule.getStructuredTags()).to.matchSnapshot();
    expect(iModule.getTags()).to.be.deep.equal({
      offre: {
        nom: {},
        prix: {},
        titre: {}
      },
      nom: {},
      prenom: {}
    });
    var data = {
      offre: [{}],
      prenom: "John"
    };
    doc.setData(data);
    doc.render();
    var fi = iModule.fullInspected["word/document.xml"];
    var _fi$nullValues = fi.nullValues,
      summary = _fi$nullValues.summary,
      detail = _fi$nullValues.detail;
    var postparsed = fi.postparsed,
      parsed = fi.parsed,
      xmllexed = fi.xmllexed;
    expect(postparsed.length).to.equal(249);
    expect(parsed.length).to.equal(385);
    expect(xmllexed.length).to.equal(383);
    expect(iModule.inspect.tags).to.be.deep.equal(data);
    expect(detail).to.be.an("array");
    expect(detail[0].part.value).to.equal("nom");
    expect(detail[0].scopeManager.scopeList[0].prenom).to.equal("John");
    expect(summary).to.be.deep.equal([["offre", "nom"], ["offre", "prix"], ["offre", "titre"], ["nom"]]);
  });
  it("should get all tags (pptx file)", function () {
    var iModule = inspectModule();
    createDoc("multi-page.pptx").attachModule(iModule).compile();
    expect(iModule.getStructuredTags()).to.matchSnapshot();
    expect(iModule.getFileType()).to.be.deep.equal("pptx");
    expect(iModule.getAllTags()).to.be.deep.equal({
      tag: {},
      users: {
        name: {}
      }
    });
    expect(iModule.getTemplatedFiles().sort()).to.be.deep.equal(["ppt/slides/slide1.xml", "ppt/slides/slide2.xml", "ppt/slideLayouts/slideLayout1.xml", "ppt/slideLayouts/slideLayout10.xml", "ppt/slideLayouts/slideLayout11.xml", "ppt/slideLayouts/slideLayout12.xml", "ppt/slideLayouts/slideLayout2.xml", "ppt/slideLayouts/slideLayout3.xml", "ppt/slideLayouts/slideLayout4.xml", "ppt/slideLayouts/slideLayout5.xml", "ppt/slideLayouts/slideLayout6.xml", "ppt/slideLayouts/slideLayout7.xml", "ppt/slideLayouts/slideLayout8.xml", "ppt/slideLayouts/slideLayout9.xml", "ppt/slideMasters/slideMaster1.xml", "ppt/presentation.xml", "docProps/app.xml", "docProps/core.xml"].sort());
  });
  it("should get all tags and merge them", function () {
    var doc = createDoc("multi-page-to-merge.pptx");
    var iModule = inspectModule();
    doc.attachModule(iModule);
    doc.compile();
    expect(iModule.getAllTags()).to.be.deep.equal({
      tag: {},
      users: {
        name: {},
        age: {},
        company: {}
      }
    });
  });
  it("should get all tags with additional data", function () {
    var doc = createDoc("tag-product-loop.docx");
    var iModule = inspectModule();
    doc.attachModule(iModule);
    doc.compile();
    expect(iModule.getAllStructuredTags()).to.be.deep.equal([{
      type: "placeholder",
      value: "products",
      raw: "#products",
      lIndex: 17,
      sectPrCount: 0,
      module: "loop",
      inverted: false,
      offset: 0,
      lastParagrapSectPr: "",
      endLindex: 216,
      subparsed: [{
        type: "placeholder",
        value: "title",
        offset: 11,
        endLindex: 33,
        lIndex: 33
      }, {
        type: "placeholder",
        value: "name",
        offset: 33,
        endLindex: 57,
        lIndex: 57
      }, {
        type: "placeholder",
        value: "reference",
        offset: 59,
        endLindex: 74,
        lIndex: 74
      }, {
        type: "placeholder",
        value: "avantages",
        module: "loop",
        raw: "#avantages",
        inverted: false,
        offset: 70,
        sectPrCount: 0,
        lastParagrapSectPr: "",
        endLindex: 192,
        lIndex: 92,
        subparsed: [{
          type: "placeholder",
          value: "title",
          offset: 82,
          endLindex: 108,
          lIndex: 108
        }, {
          type: "placeholder",
          value: "proof",
          module: "loop",
          raw: "#proof",
          sectPrCount: 0,
          lastParagrapSectPr: "",
          inverted: false,
          offset: 117,
          endLindex: 174,
          lIndex: 136,
          subparsed: [{
            type: "placeholder",
            value: "reason",
            offset: 143,
            endLindex: 158,
            lIndex: 158
          }]
        }]
      }]
    }]);
  });
});
describe("Docxtemplater loops", function () {
  it("should replace all the tags", function () {
    var tags = {
      nom: "Hipp",
      prenom: "Edgar",
      telephone: "0652455478",
      description: "New Website",
      offre: [{
        titre: "titre1",
        prix: "1260"
      }, {
        titre: "titre2",
        prix: "2000"
      }, {
        titre: "titre3",
        prix: "1400",
        nom: "Offre"
      }]
    };
    var doc = createDoc("tag-loop-example.docx");
    doc.setData(tags);
    doc.render();
    expect(doc.getFullText()).to.be.equal("Votre proposition commercialeHippPrix: 1260Titre titre1HippPrix: 2000Titre titre2OffrePrix: 1400Titre titre3HippEdgar");
  });
  it("should work with loops inside loops", function () {
    var tags = {
      products: [{
        title: "Microsoft",
        name: "DOS",
        reference: "Win7",
        avantages: [{
          title: "Everyone uses it",
          proof: [{
            reason: "it is quite cheap"
          }, {
            reason: "it is quit simple"
          }, {
            reason: "it works on a lot of different Hardware"
          }]
        }]
      }, {
        title: "Linux",
        name: "Ubuntu",
        reference: "Ubuntu10",
        avantages: [{
          title: "It's very powerful",
          proof: [{
            reason: "the terminal is your friend"
          }, {
            reason: "Hello world"
          }, {
            reason: "it's free"
          }]
        }]
      }, {
        title: "Apple",
        name: "Mac",
        reference: "OSX",
        avantages: [{
          title: "It's very easy",
          proof: [{
            reason: "you can do a lot just with the mouse"
          }, {
            reason: "It's nicely designed"
          }]
        }]
      }]
    };
    var doc = createDoc("tag-product-loop.docx");
    doc.setData(tags);
    doc.render();
    var text = doc.getFullText();
    var expectedText = "MicrosoftProduct name : DOSProduct reference : Win7Everyone uses itProof that it works nicely : It works because it is quite cheap It works because it is quit simple It works because it works on a lot of different HardwareLinuxProduct name : UbuntuProduct reference : Ubuntu10It's very powerfulProof that it works nicely : It works because the terminal is your friend It works because Hello world It works because it's freeAppleProduct name : MacProduct reference : OSXIt's very easyProof that it works nicely : It works because you can do a lot just with the mouse It works because It's nicely designed";
    expect(text.length).to.be.equal(expectedText.length);
    expect(text).to.be.equal(expectedText);
  });
  it("should work with object value", function () {
    var content = "<w:t>{#todo}{todo}{/todo}</w:t>";
    var expectedContent = '<w:t xml:space="preserve">abc</w:t>';
    var scope = {
      todo: {
        todo: "abc"
      }
    };
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope
    });
    expect(getContent(xmlTemplater)).to.be.deep.equal(expectedContent);
  });
  it("should work with string value", function () {
    var content = "<w:t>{#todo}{todo}{/todo}</w:t>";
    var expectedContent = '<w:t xml:space="preserve">abc</w:t>';
    var scope = {
      todo: "abc"
    };
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope
    });
    var c = getContent(xmlTemplater);
    expect(c).to.be.deep.equal(expectedContent);
  });
  it("should not have sideeffects with inverted with array length 3", function () {
    var content = "<w:t>{^todos}No {/todos}Todos</w:t>\n<w:t>{#todos}{.}{/todos}</w:t>";
    var expectedContent = "<w:t xml:space=\"preserve\">Todos</w:t>\n<w:t xml:space=\"preserve\">ABC</w:t>";
    var scope = {
      todos: ["A", "B", "C"]
    };
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope
    });
    var c = getContent(xmlTemplater);
    expect(c).to.be.deep.equal(expectedContent);
  });
  it("should not have sideeffects with inverted with empty array", function () {
    var content = "<w:t>{^todos}No {/todos}Todos</w:t>\n\t\t<w:t>{#todos}{.}{/todos}</w:t>";
    var expectedContent = "<w:t xml:space=\"preserve\">No Todos</w:t>\n\t\t<w:t/>";
    var scope = {
      todos: []
    };
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope
    });
    var c = getContent(xmlTemplater);
    expect(c).to.be.deep.equal(expectedContent);
  });
  it("should provide inverted loops", function () {
    var content = "<w:t>{^products}No products found{/products}</w:t>";
    [{
      products: []
    }, {
      products: false
    }, {}].forEach(function (tags) {
      var doc = createXmlTemplaterDocx(content, {
        tags: tags
      });
      expect(doc.getFullText()).to.be.equal("No products found");
    });
    [{
      products: [{
        name: "Bread"
      }]
    }, {
      products: true
    }, {
      products: "Bread"
    }, {
      products: {
        name: "Bread"
      }
    }].forEach(function (tags) {
      var doc = createXmlTemplaterDocx(content, {
        tags: tags
      });
      expect(doc.getFullText()).to.be.equal("");
    });
  });
  it("should be possible to close loops with {/}", function () {
    var content = "<w:t>{#products}Product {name}{/}</w:t>";
    var tags = {
      products: [{
        name: "Bread"
      }]
    };
    var doc = createXmlTemplaterDocx(content, {
      tags: tags
    });
    expect(doc.getFullText()).to.be.equal("Product Bread");
  });
  it("should be possible to close double loops with {/}", function () {
    var content = "<w:t>{#companies}{#products}Product {name}{/}{/}</w:t>";
    var tags = {
      companies: [{
        products: [{
          name: "Bread"
        }]
      }]
    };
    var doc = createXmlTemplaterDocx(content, {
      tags: tags
    });
    expect(doc.getFullText()).to.be.equal("Product Bread");
  });
  it("should work with complex loops", function () {
    var content = "<w:t>{title} {#users} {name} friends are : {#friends} {.</w:t>TAG..TAG<w:t>},{/friends} {/users</w:t>TAG2<w:t>}</w:t>";
    var scope = {
      title: "###Title###",
      users: [{
        name: "John Doe",
        friends: ["Jane", "Henry"]
      }, {}],
      name: "Default",
      friends: ["None"]
    };
    var doc = createXmlTemplaterDocx(content, {
      tags: scope
    });
    expect(doc.getFullText()).to.be.equal("###Title###  John Doe friends are :  Jane, Henry,  Default friends are :  None, ");
  });
});
describe("Changing the parser", function () {
  it("should work with uppercassing", function () {
    var content = "<w:t>Hello {name}</w:t>";
    var scope = {
      name: "Edgar"
    };
    function parser(tag) {
      return _defineProperty({}, "get", function get(scope) {
        return scope[tag].toUpperCase();
      });
    }
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope,
      parser: parser
    });
    expect(xmlTemplater.getFullText()).to.be.equal("Hello EDGAR");
  });
  it("should work when setting from the Docxtemplater interface", function () {
    var doc = createDoc("tag-example.docx");
    var zip = new PizZip(doc.loadedContent);
    var d = new Docxtemplater().loadZip(zip);
    var tags = {
      first_name: "Hipp",
      last_name: "Edgar",
      phone: "0652455478",
      description: "New Website"
    };
    d.setData(tags);
    d.parser = function (tag) {
      return _defineProperty({}, "get", function get(scope) {
        return scope[tag].toUpperCase();
      });
    };
    d.render();
    expect(d.getFullText()).to.be.equal("EDGAR HIPP");
    expect(d.getFullText("word/header1.xml")).to.be.equal("EDGAR HIPP0652455478NEW WEBSITE");
    expect(d.getFullText("word/footer1.xml")).to.be.equal("EDGARHIPP0652455478");
  });
  it("should work with angular parser", function () {
    var tags = {
      person: {
        first_name: "Hipp",
        last_name: "Edgar",
        birth_year: 1955,
        age: 59
      }
    };
    var doc = createDoc("angular-example.docx");
    doc.setData(tags);
    doc.setOptions({
      parser: angularParser
    });
    doc.render();
    expect(doc.getFullText()).to.be.equal("Hipp Edgar 2014");
  });
  it("should work with loops", function () {
    var content = "<w:t>Hello {#person.adult}you{/person.adult}</w:t>";
    var scope = {
      person: {
        name: "Edgar",
        adult: true
      }
    };
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope,
      parser: angularParser
    });
    expect(xmlTemplater.getFullText()).to.be.equal("Hello you");
  });
  it("should work with loops with angularParser for ie 11", function () {
    var content = "<w:t>Hello {#person.adult}you{/person.adult}</w:t>";
    var scope = {
      person: {
        name: "Edgar",
        adult: true
      }
    };
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope,
      parser: angularParserIE11
    });
    expect(xmlTemplater.getFullText()).to.be.equal("Hello you");
  });
  it("should be able to access meta to get the index", function () {
    var content = "<w:t>Hello {#users}{$index} {#$isFirst}@{/}{#$isLast}!{/}{name} {/users}</w:t>";
    var scope = {
      users: [{
        name: "Jane"
      }, {
        name: "Mary"
      }]
    };
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope,
      parser: function parser(tag) {
        return {
          get: function get(scope, context) {
            if (tag === "$index") {
              return last(context.scopePathItem);
            }
            if (tag === "$isLast") {
              var totalLength = context.scopePathLength[context.scopePathLength.length - 1];
              var index = context.scopePathItem[context.scopePathItem.length - 1];
              return index === totalLength - 1;
            }
            if (tag === "$isFirst") {
              var _index = context.scopePathItem[context.scopePathItem.length - 1];
              return _index === 0;
            }
            return scope[tag];
          }
        };
      }
    });
    expect(xmlTemplater.getFullText()).to.be.equal("Hello 0 @Jane 1 !Mary ");
  });
  it("should be able to disable parent scope inheritance", function () {
    var content = "<w:t>Hello {#users}{companyName}-{name} {/}</w:t>";
    var scope = {
      users: [{
        name: "Jane"
      }, {}],
      companyName: "My company, should not be shown",
      name: "Foo"
    };
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope,
      nullGetter: function nullGetter(part) {
        if (!part.module) {
          return "NULL";
        }
        if (part.module === "rawxml") {
          return "";
        }
        return "";
      },
      parser: function parser(tag) {
        return {
          get: function get(scope, context) {
            if (context.num < context.scopePath.length) {
              return null;
            }
            if (context.num > context.scopePath.length) {
              throw new Error("Invalid context num");
            }
            return scope[tag];
          }
        };
      }
    });
    expect(xmlTemplater.getFullText()).to.be.equal("Hello NULL-Jane NULL-NULL ");
  });
  it("should be able to retrieve parent scope with .. syntax and ... syntax", function () {
    var content = "<w:t>{#loop}{#contractors}{...company} {..company} {company} {/}{/loop}</w:t>";
    var tags = {
      company: "Root company",
      loop: [{
        company: "ACME Company",
        contractors: [{
          company: "The other Company"
        }, {
          company: "Foobar Company"
        }]
      }]
    };
    var options = {
      parser: function parser(tag) {
        var matchesParent = /^(\.{2,})(.*)/g;
        var parentCount = 0;
        if (matchesParent.test(tag)) {
          parentCount = tag.replace(matchesParent, "$1").length - 1;
          tag = tag.replace(matchesParent, "$2");
        }
        return {
          get: function get(scope, context) {
            if (context.scopePath.length - context.num < parentCount) {
              return null;
            }
            return scope[tag];
          }
        };
      },
      tags: tags
    };
    var doc = createXmlTemplaterDocx(content, options);
    var fullText = doc.getFullText();
    expect(fullText).to.be.equal("Root company ACME Company The other Company Root company ACME Company Foobar Company ");
  });
  it("should be able to have scopePathItem with different lengths when having conditions", function () {
    var content = "<w:t>{#cond}{name}{/}</w:t>";
    var scope = {
      cond: true,
      name: "John"
    };
    var innerContext = null;
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope,
      parser: function parser(tag) {
        return {
          get: function get(scope, context) {
            if (tag === "name") {
              innerContext = context;
            }
            return scope[tag];
          }
        };
      }
    });
    expect(xmlTemplater.getFullText()).to.be.equal("John");
    expect(innerContext.scopePath).to.be.deep.equal(["cond"]);
    expect(innerContext.scopePathItem).to.be.deep.equal([0]);
    expect(innerContext.scopeList.length).to.be.equal(2);
    expect(innerContext.scopeList[0]).to.be.deep.equal(innerContext.scopeList[1]);
  });
  it("should call the parser just once", function () {
    var calls = 0;
    var content = "<w:t>{name}</w:t>";
    var scope = {
      name: "John"
    };
    createXmlTemplaterDocx(content, {
      tags: scope,
      parser: function parser(tag) {
        return {
          get: function get(scope) {
            calls++;
            return scope[tag];
          }
        };
      }
    });
    expect(calls).to.equal(1);
  });
  it("should be able to access meta and context to get the type of tag", function () {
    var content = "<w:p><w:t>Hello {#users}{name}{/users}</w:t></w:p>\n\t\t<w:p><w:t>{@rrr}</w:t></w:p>\n\t\t";
    var scope = {
      users: [{
        name: "Jane"
      }],
      rrr: ""
    };
    var contexts = [];
    var pX = [];
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope,
      parser: function parser(tag, x) {
        pX.push(x);
        return {
          get: function get(scope, context) {
            contexts.push(context);
            if (tag === "$index") {
              return last(context.scopePathItem);
            }
            return scope[tag];
          }
        };
      }
    });
    expect(xmlTemplater.getFullText()).to.be.equal("Hello Jane");
    var values = contexts.map(function (_ref3) {
      var _ref3$meta$part = _ref3.meta.part,
        type = _ref3$meta$part.type,
        value = _ref3$meta$part.value,
        module = _ref3$meta$part.module;
      return {
        type: type,
        value: value,
        module: module
      };
    });
    expect(values).to.be.deep.equal([{
      type: "placeholder",
      value: "users",
      module: "loop"
    }, {
      type: "placeholder",
      value: "name",
      module: undefined
    }, {
      type: "placeholder",
      value: "rrr",
      module: "rawxml"
    }]);
    expect(pX.map(function (_ref4) {
      var _ref4$tag = _ref4.tag,
        type = _ref4$tag.type,
        value = _ref4$tag.value,
        module = _ref4$tag.module;
      return {
        type: type,
        value: value,
        module: module
      };
    })).to.be.deep.equal([{
      type: "placeholder",
      value: "name",
      module: undefined
    }, {
      type: "placeholder",
      value: "users",
      module: "loop"
    }, {
      type: "placeholder",
      value: "rrr",
      module: "rawxml"
    }]);
  });
});
describe("Change the delimiters", function () {
  it("should work with lt and gt delimiter < and >", function () {
    var doc = createDoc("delimiter-gt.docx");
    doc.setOptions({
      delimiters: {
        start: "<",
        end: ">"
      }
    });
    doc.render({
      user: "John"
    });
    var fullText = doc.getFullText();
    expect(fullText).to.be.equal("Hello John");
  });
  it("should work with delimiter % both sides", function () {
    var doc = createDoc("delimiter-pct.docx");
    doc.setOptions({
      delimiters: {
        start: "%",
        end: "%"
      }
    });
    doc.setData({
      user: "John",
      company: "PCorp"
    });
    doc.render();
    var fullText = doc.getFullText();
    expect(fullText).to.be.equal("Hello John from PCorp");
  });
});
describe("Special characters", function () {
  it("should parse placeholder containing special characters", function () {
    var content = "<w:t>Hello {&gt;name}</w:t>";
    var scope = {
      ">name": "Edgar"
    };
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope
    });
    var c = getContent(xmlTemplater);
    expect(c).to.be.deep.equal('<w:t xml:space="preserve">Hello Edgar</w:t>');
  });
  it("should not decode xml entities recursively", function () {
    var content = "<w:t>Hello {&amp;lt;}</w:t>";
    var scope = {
      "&lt;": "good",
      "<": "bad!!"
    };
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope
    });
    var c = getContent(xmlTemplater);
    expect(c).to.be.deep.equal('<w:t xml:space="preserve">Hello good</w:t>');
  });
  it("should render placeholder containing special characters", function () {
    var content = "<w:t>Hello {name}</w:t>";
    var scope = {
      name: "<Edgar>"
    };
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope
    });
    var c = getContent(xmlTemplater);
    expect(c).to.be.deep.equal('<w:t xml:space="preserve">Hello &lt;Edgar&gt;</w:t>');
  });
  it("should read full text correctly", function () {
    var doc = createDoc("cyrillic.docx");
    var fullText = doc.getFullText();
    expect(fullText.charCodeAt(0)).to.be.equal(1024);
    expect(fullText.charCodeAt(1)).to.be.equal(1050);
    expect(fullText.charCodeAt(2)).to.be.equal(1048);
    expect(fullText.charCodeAt(3)).to.be.equal(1046);
    expect(fullText.charCodeAt(4)).to.be.equal(1044);
    expect(fullText.charCodeAt(5)).to.be.equal(1045);
    expect(fullText.charCodeAt(6)).to.be.equal(1039);
    expect(fullText.charCodeAt(7)).to.be.equal(1040);
  });
  it("should still read full text after applying tags", function () {
    var doc = createDoc("cyrillic.docx");
    doc.setData({
      name: "Edgar"
    });
    doc.render();
    var fullText = doc.getFullText();
    expect(fullText.charCodeAt(0)).to.be.equal(1024);
    expect(fullText.charCodeAt(1)).to.be.equal(1050);
    expect(fullText.charCodeAt(2)).to.be.equal(1048);
    expect(fullText.charCodeAt(3)).to.be.equal(1046);
    expect(fullText.charCodeAt(4)).to.be.equal(1044);
    expect(fullText.charCodeAt(5)).to.be.equal(1045);
    expect(fullText.charCodeAt(6)).to.be.equal(1039);
    expect(fullText.charCodeAt(7)).to.be.equal(1040);
    expect(fullText.indexOf("Edgar")).to.be.equal(9);
  });
  it("should insert russian characters", function () {
    var russian = "Пупкина";
    var doc = createDoc("tag-example.docx");
    var zip = new PizZip(doc.loadedContent);
    var d = new Docxtemplater().loadZip(zip);
    d.setData({
      last_name: russian
    });
    d.render();
    var outputText = d.getFullText();
    expect(outputText.substr(0, 7)).to.be.equal(russian);
  });
});
describe("Complex table example", function () {
  it("should not do anything special when loop outside of table", function () {
    ["<w:p><w:t>{#tables}</w:t></w:p>\n<w:tbl><w:tr><w:tc>\n<w:p><w:t>{user}</w:t></w:p>\n</w:tc></w:tr></w:tbl>\n<w:p><w:t>{/tables}</w:t></w:p>"].forEach(function (content) {
      var scope = {
        tables: [{
          user: "John"
        }, {
          user: "Jane"
        }]
      };
      var doc = createXmlTemplaterDocx(content, {
        tags: scope
      });
      var c = getContent(doc);
      expect(c).to.be.equal("<w:p><w:t/></w:p>\n<w:tbl><w:tr><w:tc>\n<w:p><w:t xml:space=\"preserve\">John</w:t></w:p>\n</w:tc></w:tr></w:tbl>\n<w:p><w:t/></w:p>\n<w:tbl><w:tr><w:tc>\n<w:p><w:t xml:space=\"preserve\">Jane</w:t></w:p>\n</w:tc></w:tr></w:tbl>\n<w:p><w:t/></w:p>");
    });
  });
  it("should work when looping inside tables", function () {
    var tags = {
      table1: [1],
      key: "value"
    };
    var template = "<w:tr>\n\t\t<w:tc><w:p><w:t>{#table1}Hi</w:t></w:p></w:tc>\n\t\t<w:tc><w:p><w:t>{/table1}</w:t></w:p> </w:tc>\n\t\t</w:tr>\n\t\t<w:tr>\n\t\t<w:tc><w:p><w:t>{#table1}Ho</w:t></w:p></w:tc>\n\t\t<w:tc><w:p><w:t>{/table1}</w:t></w:p></w:tc>\n\t\t</w:tr>\n\t\t<w:p><w:t>{key}</w:t></w:p>\n\t\t";
    var doc = createXmlTemplaterDocx(template, {
      tags: tags
    });
    var fullText = doc.getFullText();
    expect(fullText).to.be.equal("HiHovalue");
    var expected = "<w:tr>\n\t\t<w:tc><w:p><w:t xml:space=\"preserve\">Hi</w:t></w:p></w:tc>\n\t\t<w:tc><w:p><w:t/></w:p> </w:tc>\n\t\t</w:tr>\n\t\t<w:tr>\n\t\t<w:tc><w:p><w:t xml:space=\"preserve\">Ho</w:t></w:p></w:tc>\n\t\t<w:tc><w:p><w:t/></w:p></w:tc>\n\t\t</w:tr>\n\t\t<w:p><w:t xml:space=\"preserve\">value</w:t></w:p>\n\t\t";
    var c = getContent(doc);
    expect(c).to.be.equal(expected);
  });
});
describe("Raw Xml Insertion", function () {
  it("should work with simple example", function () {
    var inner = "<w:p><w:r><w:t>{@complexXml}</w:t></w:r></w:p>";
    var content = "<w:document>".concat(inner, "</w:document>");
    var scope = {
      complexXml: '<w:p w:rsidR="00612058" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:color w:val="FF0000"/></w:rPr></w:pPr><w:r><w:rPr><w:color w:val="FF0000"/></w:rPr><w:t>My custom XML</w:t></w:r></w:p><w:tbl><w:tblPr><w:tblStyle w:val="Grilledutableau"/><w:tblW w:w="0" w:type="auto"/><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr><w:tblGrid><w:gridCol w:w="2952"/><w:gridCol w:w="2952"/><w:gridCol w:w="2952"/></w:tblGrid><w:tr w:rsidR="00EA4B08" w:rsidTr="00EA4B08"><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="DDD9C3" w:themeFill="background2" w:themeFillShade="E6"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRPr="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:b/><w:color w:val="000000" w:themeColor="text1"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:color w:val="000000" w:themeColor="text1"/></w:rPr><w:t>Test</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="DDD9C3" w:themeFill="background2" w:themeFillShade="E6"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRPr="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:b/><w:color w:val="FF0000"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FF0000"/></w:rPr><w:t>Xml</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="DDD9C3" w:themeFill="background2" w:themeFillShade="E6"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:color w:val="FF0000"/></w:rPr></w:pPr><w:r><w:rPr><w:color w:val="FF0000"/></w:rPr><w:t>Generated</w:t></w:r></w:p></w:tc></w:tr><w:tr w:rsidR="00EA4B08" w:rsidTr="00EA4B08"><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="C6D9F1" w:themeFill="text2" w:themeFillTint="33"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRPr="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:color w:val="000000" w:themeColor="text1"/><w:u w:val="single"/></w:rPr></w:pPr><w:r w:rsidRPr="00EA4B08"><w:rPr><w:color w:val="000000" w:themeColor="text1"/><w:u w:val="single"/></w:rPr><w:t>Underline</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="C6D9F1" w:themeFill="text2" w:themeFillTint="33"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:color w:val="FF0000"/></w:rPr></w:pPr><w:r w:rsidRPr="00EA4B08"><w:rPr><w:color w:val="FF0000"/><w:highlight w:val="yellow"/></w:rPr><w:t>Highlighting</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="C6D9F1" w:themeFill="text2" w:themeFillTint="33"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRPr="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:rFonts w:ascii="Bauhaus 93" w:hAnsi="Bauhaus 93"/><w:color w:val="FF0000"/></w:rPr></w:pPr><w:r w:rsidRPr="00EA4B08"><w:rPr><w:rFonts w:ascii="Bauhaus 93" w:hAnsi="Bauhaus 93"/><w:color w:val="FF0000"/></w:rPr><w:t>Font</w:t></w:r></w:p></w:tc></w:tr><w:tr w:rsidR="00EA4B08" w:rsidTr="00EA4B08"><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F2DBDB" w:themeFill="accent2" w:themeFillTint="33"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00EA4B08"><w:pPr><w:jc w:val="center"/><w:rPr><w:color w:val="FF0000"/></w:rPr></w:pPr><w:r><w:rPr><w:color w:val="FF0000"/></w:rPr><w:t>Centering</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F2DBDB" w:themeFill="accent2" w:themeFillTint="33"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRPr="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:i/><w:color w:val="FF0000"/></w:rPr></w:pPr><w:r w:rsidRPr="00EA4B08"><w:rPr><w:i/><w:color w:val="FF0000"/></w:rPr><w:t>Italic</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F2DBDB" w:themeFill="accent2" w:themeFillTint="33"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:color w:val="FF0000"/></w:rPr></w:pPr></w:p></w:tc></w:tr><w:tr w:rsidR="00EA4B08" w:rsidTr="00EA4B08"><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="E5DFEC" w:themeFill="accent4" w:themeFillTint="33"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:color w:val="FF0000"/></w:rPr></w:pPr></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="E5DFEC" w:themeFill="accent4" w:themeFillTint="33"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:color w:val="FF0000"/></w:rPr></w:pPr></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="E5DFEC" w:themeFill="accent4" w:themeFillTint="33"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:color w:val="FF0000"/></w:rPr></w:pPr></w:p></w:tc></w:tr><w:tr w:rsidR="00EA4B08" w:rsidTr="00EA4B08"><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="FDE9D9" w:themeFill="accent6" w:themeFillTint="33"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:color w:val="FF0000"/></w:rPr></w:pPr></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="FDE9D9" w:themeFill="accent6" w:themeFillTint="33"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:color w:val="FF0000"/></w:rPr></w:pPr></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="2952" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="FDE9D9" w:themeFill="accent6" w:themeFillTint="33"/></w:tcPr><w:p w:rsidR="00EA4B08" w:rsidRDefault="00EA4B08" w:rsidP="00612058"><w:pPr><w:rPr><w:color w:val="FF0000"/></w:rPr></w:pPr></w:p></w:tc></w:tr></w:tbl>'
    };
    var doc = createXmlTemplaterDocx(content, {
      tags: scope
    });
    var c = getContent(doc);
    expect(c.length).to.be.equal(content.length + scope.complexXml.length - inner.length + "<w:p/>".length);
    expect(c).to.contain(scope.complexXml);
  });
  it("should work even when tags are after the xml", function () {
    var content = "<w:tbl>\n\t\t<w:tr>\n\t\t<w:tc>\n\t\t<w:p>\n\t\t<w:r>\n\t\t<w:t>{@complexXml}</w:t>\n\t\t</w:r>\n\t\t</w:p>\n\t\t</w:tc>\n\t\t</w:tr>\n\t\t<w:tr>\n\t\t<w:tc>\n\t\t<w:p>\n\t\t<w:r>\n\t\t<w:t>{name}</w:t>\n\t\t</w:r>\n\t\t</w:p>\n\t\t</w:tc>\n\t\t</w:tr>\n\t\t<w:tr>\n\t\t<w:tc>\n\t\t<w:p>\n\t\t<w:r>\n\t\t<w:t>{first_name}</w:t>\n\t\t</w:r>\n\t\t</w:p>\n\t\t</w:tc>\n\t\t</w:tr>\n\t\t<w:tr>\n\t\t<w:tc>\n\t\t<w:p>\n\t\t<w:r>\n\t\t<w:t>{#products} {year}</w:t>\n\t\t</w:r>\n\t\t</w:p>\n\t\t</w:tc>\n\t\t<w:tc>\n\t\t<w:p>\n\t\t<w:r>\n\t\t<w:t>{name}</w:t>\n\t\t</w:r>\n\t\t</w:p>\n\t\t</w:tc>\n\t\t<w:tc>\n\t\t<w:p>\n\t\t<w:r>\n\t\t<w:t>{company}{/products}</w:t>\n\t\t</w:r>\n\t\t</w:p>\n\t\t</w:tc>\n\t\t</w:tr>\n\t\t</w:tbl>\n\t\t";
    var scope = {
      complexXml: "<w:p><w:r><w:t>Hello</w:t></w:r></w:p>",
      name: "John",
      first_name: "Doe",
      products: [{
        year: 1550,
        name: "Moto",
        company: "Fein"
      }, {
        year: 1987,
        name: "Water",
        company: "Test"
      }, {
        year: 2010,
        name: "Bread",
        company: "Yu"
      }]
    };
    var doc = createXmlTemplaterDocx(content, {
      tags: scope
    });
    var c = getContent(doc);
    expect(c).to.contain(scope.complexXml);
    expect(doc.getFullText()).to.be.equal("HelloJohnDoe 1550MotoFein 1987WaterTest 2010BreadYu");
  });
  it("should work with false value", function () {
    var content = "\n\t\t\t<w:p><w:r><w:t>{@rawXML}</w:t></w:r></w:p>\n\t\t\t<w:p><w:r><w:t>Hi</w:t></w:r></w:p>\n\t\t";
    var doc = createXmlTemplaterDocx(content, {
      tags: {
        rawXML: false
      }
    });
    expect(doc.getFullText()).to.be.equal("Hi");
  });
  it("should work with closing tag in the form of <w:t>}{/body}</w:t>", function () {
    var scope = {
      body: [{
        paragraph: "hello"
      }]
    };
    var content = "<w:t>{#body}</w:t>\n\t\t<w:t>{paragraph</w:t>\n\t\t\t<w:t>}{/body}</w:t>";
    var xmlTemplater = createXmlTemplaterDocx(content, {
      tags: scope
    });
    var c = getContent(xmlTemplater);
    expect(c).not.to.contain("</w:t></w:t>");
  });
  it("should work with simple example and given options", function () {
    var scope = {
      xmlTag: '<w:r><w:rPr><w:color w:val="FF0000"/></w:rPr><w:t>My custom</w:t></w:r><w:r><w:rPr><w:color w:val="00FF00"/></w:rPr><w:t>XML</w:t></w:r>'
    };
    var doc = createDoc("one-raw-xml-tag.docx", {
      fileTypeConfig: assign({}, Docxtemplater.FileTypeConfig.docx(), {
        tagRawXml: "w:r"
      })
    });
    doc.setData(scope);
    doc.render();
    expect(doc.getFullText()).to.be.equal("asdfMy customXMLqwery");
  });
});
describe("Multi line", function () {
  it("should work when tag spans multiple lines (paragraphs)", function () {
    return this.render({
      name: "tag-spanning-multiline.docx",
      data: {
        first_name: "Hipp",
        last_name: "Edgar",
        phone: "0652455478",
        description: "New Website"
      },
      expectedName: "expected-tag-spanning-multiline.docx"
    });
  });
});
describe("Serialization", function () {
  it("should be serialiazable (useful for logging)", function () {
    var doc = createDoc("tag-example.docx");
    JSON.stringify(doc);
  });
});
describe("Constructor v4", function () {
  it("should work when modules are attached", function () {
    var isModuleCalled = false;
    var module = {
      name: "TestModule",
      optionsTransformer: function optionsTransformer(options) {
        isModuleCalled = true;
        return options;
      }
    };
    createDocV4("tag-example.docx", {
      modules: [module]
    });
    expect(isModuleCalled).to.equal(true);
  });
  it("should throw an error when modules passed is not an array", function () {
    expect(function () {
      return new Docxtemplater(getZip("tag-example.docx"), {
        modules: {}
      });
    }).to["throw"]("The modules argument of docxtemplater's constructor must be an array");
  });
  it("should throw an error when an invalid zip is passed", function () {
    var zip = getZip("tag-example.docx");
    zip.files = null;
    expect(function () {
      return new Docxtemplater(zip);
    }).to["throw"]("The first argument of docxtemplater's constructor must be a valid zip file (jszip v2 or pizzip v3)");
    expect(function () {
      return new Docxtemplater("content");
    }).to["throw"]("The first argument of docxtemplater's constructor must be a valid zip file (jszip v2 or pizzip v3)");
    expect(function () {
      return new Docxtemplater({
        files: []
      });
    }).to["throw"]("The first argument of docxtemplater's constructor must be a valid zip file (jszip v2 or pizzip v3)");
    if (typeof Buffer !== "undefined") {
      expect(function () {
        return new Docxtemplater(Buffer.from("content"));
      }).to["throw"]("The first argument of docxtemplater's constructor must be a valid zip file (jszip v2 or pizzip v3)");
    }
  });
  it("should fail if using setOptions without options", function () {
    var doc = createDoc("tag-multiline.docx");
    expect(function () {
      return doc.setOptions();
    }).to["throw"]("setOptions should be called with an object as first parameter");
  });
  it("should work when the delimiters are passed", function () {
    var options = {
      delimiters: {
        start: "<",
        end: ">"
      }
    };
    var doc = createDocV4("delimiter-gt.docx", options);
    doc.render({
      user: "John"
    });
    var fullText = doc.getFullText();
    expect(fullText).to.be.equal("Hello John");
  });
  it("should work when both modules and delimiters are passed and modules should have access to options object", function () {
    var isModuleCalled = false,
      optionsPassedToModule;
    var options = {
      delimiters: {
        start: "%",
        end: "%"
      },
      modules: [{
        name: "MyModule",
        optionsTransformer: function optionsTransformer(options) {
          optionsPassedToModule = options;
          isModuleCalled = true;
          return options;
        }
      }]
    };
    var doc = createDocV4("delimiter-pct.docx", options);
    doc.setData({
      user: "John",
      company: "Acme"
    });
    expect(isModuleCalled).to.be.equal(true);
    expect(optionsPassedToModule.delimiters.start).to.be.equal("%");
    expect(optionsPassedToModule.delimiters.end).to.be.equal("%");
    // Verify that default options are passed to the modules
    expect(optionsPassedToModule.linebreaks).to.be.equal(false);
    doc.render();
    var fullText = doc.getFullText();
    expect(fullText).to.be.equal("Hello John from Acme");
  });
  var MyTestModule = /*#__PURE__*/function () {
    function MyTestModule() {
      _classCallCheck(this, MyTestModule);
    }
    return _createClass(MyTestModule, [{
      key: "render",
      value: function render(part) {
        return {
          value: part.value
        };
      }
    }]);
  }();
  it("should throw error when using a non-instanciated class as a module", function () {
    var options = {
      delimiters: {
        start: "%",
        end: "%"
      },
      modules: [MyTestModule]
    };
    expect(function () {
      return createDocV4("delimiter-pct.docx", options);
    }).to["throw"]("Cannot attach a class/function as a module. Most probably you forgot to instantiate the module by using `new` on the module.");
  });
  it("should throw if using v4 constructor and setOptions", function () {
    var doc = createDocV4("tag-multiline.docx");
    expect(function () {
      return doc.setOptions({
        linebreaks: true
      });
    }).to["throw"]("setOptions() should not be called manually when using the v4 constructor");
  });
  it("should throw if using v4 constructor and attachModule", function () {
    var doc = createDocV4("tag-multiline.docx");
    doc.setData({
      description: "a\nb\nc"
    });
    expect(function () {
      return doc.attachModule({
        render: function render() {}
      });
    }).to["throw"]("attachModule() should not be called manually when using the v4 constructor");
  });
  it("should throw if using v4 constructor and loadZip", function () {
    var doc = createDocV4("tag-multiline.docx");
    expect(function () {
      return doc.loadZip();
    }).to["throw"]("loadZip() should not be called manually when using the v4 constructor");
  });
  it("should render correctly", function () {
    var doc = new Docxtemplater(getZip("tag-example.docx"));
    var tags = {
      first_name: "John",
      last_name: "Doe"
    };
    doc.setData(tags);
    doc.render();
    expect(doc.getFullText()).to.be.equal("Doe John");
  });
  it("should work when modules are attached with valid filetypes", function () {
    var isModuleCalled = false;
    var module = {
      name: "FooModule",
      optionsTransformer: function optionsTransformer(options) {
        isModuleCalled = true;
        return options;
      },
      supportedFileTypes: ["pptx", "docx"]
    };
    createDocV4("tag-example.docx", {
      modules: [module]
    });
    expect(isModuleCalled).to.equal(true);
  });
  it("should throw an error when supportedFieldType property in passed module is not an Array", function () {
    var zip = getZip("tag-example.docx");
    var module = {
      optionsTransformer: function optionsTransformer(options) {
        return options;
      },
      supportedFileTypes: "pptx"
    };
    expect(function () {
      return new Docxtemplater(zip, {
        modules: [module]
      });
    }).to["throw"]("The supportedFileTypes field of the module must be an array");
  });
  it("should fail with readable error when using new Docxtemplater(null)", function () {
    expect(function () {
      return new Docxtemplater(null, {});
    }).to["throw"]("The first argument of docxtemplater's constructor must be a valid zip file (jszip v2 or pizzip v3)");
  });
  it("should fail with readable error when using new Docxtemplater(null, {modules: [inspectModule()]})", function () {
    expect(function () {
      return new Docxtemplater(null, {
        modules: [inspectModule()]
      });
    }).to["throw"]("The first argument of docxtemplater's constructor must be a valid zip file (jszip v2 or pizzip v3)");
  });
});