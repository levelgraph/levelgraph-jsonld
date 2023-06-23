

### 2.0.1 
- try to fix the issue https://github.com/levelgraph/levelgraph-jsonld/pull/77
- upgrade outdated dependencies
- remove deprecated istanbul & zul  dev-dep, and test using it,
- add a basic levl test with tape
- write test wite tape



<a name="0.4.0"></a>
## 0.4.0 (2014-11-24)

#### Breaking Changes

* Changed internal representation of *Literals* (removing &lt; &gt;)
  ```"42"^^<http://www.w3.org/2001/XMLSchema#integer>``` becomes
  ``` "42"^^http://www.w3.org/2001/XMLSchema#integer ```

  If you need a script to migrate your data please [create new
issue](https://github.com/mcollina/levelgraph-jsonld/issues)
