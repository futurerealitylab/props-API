window.definePropsMethods = function(propsObject) {

   propsObject.get = (path, returnName) => {
      let prps = propsObject, j, value, index;
      
      while((j = path.indexOf('.')) > 0) {
         prps = prps[path.substring(0, j)];
         if (prps === undefined)
            return undefined;
         path = path.substring(j+1, path.length);
      }

      value = prps[path];
      if (Array.isArray(value))
         return value[0];

      if (typeof value == 'string') {
         j = value.indexOf(':');
         index = j < 0 ? 0 : parseInt(value.substring(j+1, value.length));
         if (! returnName)
            return index;
         value = j < 0 ? value : value.substring(0, j);
         return value.split(',')[index];
      }

      if (typeof value == 'object') {
         let result = [];
         for (let key in value)
            result.push(value[key][0]);
         return result;
      }

      return value;
   }

   propsObject.set = (path, newValue) => {
      let getIndex = (arr, obj) => {
         let i = arr.length;
         while (--i >= 0 && arr[i] !== obj) ;
         return i;
      }

      let setValue = (props, name) => {
         let setNumberValue = (p, v) => p[0] = p.length == 4 ? v - (v % p[3]) : v;
         let value = props[name], j = 0;
         if (newValue === undefined)
            delete props[name];
         else if (Array.isArray(value) && typeof newValue == 'number') {
            setNumberValue(props[name], newValue);
         }
         else if (typeof value == 'object' && Array.isArray(newValue)) {
            for (let key in value)
               setNumberValue(value[key], newValue[j++]);
         }
         else if (typeof value != 'string') {
            props[name] = newValue;
            if (typeof newValue == 'string' && newValue.indexOf(':') < 0)
               props[name] += ':0';
         }
         else if (typeof newValue == 'string') {
            let j = (value + ':').indexOf(':'),
                s = value.substring(0, j);
            if ((j = getIndex(s.split(','), newValue)) >= 0)
               props[name] = s + ':' + j;
         }
         else {
            props[name] = (j = value.indexOf(':')) < 0
                        ? props[name] + ':' + newValue
                        : value.substring(0, j+1) + newValue;
         }
      }

      let props = propsObject;
      for (let i ; (i = path.indexOf('.')) >= 0 ; ) {
         let prefix = path.substring(0, i);
         props = props[prefix];
         if (props === undefined)
	    props = {};
         path = path.substring(i + 1, path.length);
      }
      setValue(props, path);

      return propsObject;
   }

   propsObject.delete       = path => propsObject.set(path);
   propsObject.createNode   = path => propsObject.set(path, {});
   propsObject.createSlider = (path,val,lo,hi) => propsObject.set(path, [val,lo,hi]);
   propsObject.createChoice = (path,array) => propsObject.set(path, array.join());

}

