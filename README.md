# Graphiti
Rudimentary graph model/entity plugins.  This implementation works with couchdb, but the interface is flexible enough to support any db.  

## Install 

```
npm i graphiti
```

# Model/Entity Creation

```
var BaseModel = require('graphiti').BaseModel;
var BaseEntity = require('graphiti').BaseEntity;

var Dog = BaseModel.extend({
	schema: {
		name: {
			required: true,
			type: 'string'
		}
	}
});

var DogPound = BaseEntity.extend({
	schema: {
		name: {
			required: true,
			type: 'string'
		},
		city: {
			required: true,
			type: 'string'
		},
		state: {
			required: true,
			type: 'string'
		}
	},
	graph_schema: {
    "id": "/graph",
    "type": "object",
    "properties": {
      "model_type": {
        "enum": [
          "dog"
        ],
        "required": true
      }
    }
  }
});

```

# Model Usage

Configure it just like any other mixdown plugin:

```
{
  "plugins": {
    "dogs": {
      "module": "dog",
      "options": {
        "couchdb": {
          "url": "http://localhost:5984",
          "database": "dogs"
        }
      }
    },
    "dog_pound": {
      "module": "./dog_pound.js",
      "options": {
        "couchdb": {
          "url": "http://localhost:5984",
          "database": "dogs"
        }
      }
    }
  }
}

# Insert Data

```
app.dogs.save({
	name: 'Snoop'
});

app.dogs.save({
	name: 'Dre'
});
```

```
var dre = app.dogs.get( ... );  //async signature omitted for brevity
var snoop = app.dogs.get( ... );  //async signature omitted for brevity

var lbc = app.dog_pound.new_entity({
	name: 'LBC',
	city: 'Long Beach',
	state: 'CA'
});

lbc.add_content(dre);
lbc.add_content(snoop);
app.dog_pound.save(lbc);

```


# Fetch Data

```
Once attached to an app, you just call it:

```
app.dogs.get(snoop_id, function(err, snoop_dog) {
	console.log(snoop_dog.view_model());
});
```


```
app.dog_pound.get(lbc_id, function(err, record) {
	
	app.dog_pound.hydrate(record, function(err, lbc) {
		console.log(lbc.view_model());
	});

});

```
