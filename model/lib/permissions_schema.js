module.exports = {
  "id": "/permission",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "read": {
      "type": "boolean",
      "required": true,
      "default": true
    },
    "write": {
      "type": "boolean",
      "required": true,
      "default": false
    },
    "del": {
      "type": "boolean",
      "required": true,
      "default": false
    },
    "modify_permissions": {
      "type": "boolean",
      "required": true,
      "default": false
    }
  }
};