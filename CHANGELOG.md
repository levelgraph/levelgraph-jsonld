<a name="0.4.0"></a>
## 0.4.0 (2014-11-24)

#### Breaking Changes

* Changed internal representation of *Literals* (removing &lt; &gt;)
  ```"42"^^<http://www.w3.org/2001/XMLSchema#integer>``` becomes
  ``` "42"^^http://www.w3.org/2001/XMLSchema#integer ```

  If you need a script to migrate your data please [create new
issue](https://github.com/mcollina/levelgraph-jsonld/issues)

