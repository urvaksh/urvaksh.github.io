//Wrapper object for session Storage. This way it's in its own module and not global
export default {

	getString : function(key) {
		var value = window.sessionStorage.getItem(key);
		return (value)?value:null;
	},

	getObject : function(key){
		var value = this.getString(key);
		return (value)?JSON.parse(value):null;
	},

	setString : function(key, value){
		window.sessionStorage.setItem(key,value);
	},

	setObject : function(key, obj){
		if(obj){
			this.setString(key, JSON.stringify(obj))
		} else {
			this.setString(key,"");
		}
	}
};
