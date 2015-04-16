module.exports = {
  "id": {
    "type": "string",
    "required": true,
    "minLength": 32,
    "maxLength": 36
  },
  "created_by": {
    "type": "string",
    "required": true,
    "minLength": 32,
    "maxLength": 36
  },
  "created_date": {
    "type": "string",
    "format": "date-time",
    "required": true
  },
  "updated_by": {
    "type": "string",
    "required": true,
    "minLength": 32,
    "maxLength": 36
  },
  "updated_date": {
    "type": "string",
    "format": "utc-millisec",
    "required": true
  },
  "active": {
    "type": "boolean",
    "required": true,
    "default": true
  }
};