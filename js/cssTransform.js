function cssTransform(elem,attr,val){
	if(!elem.transform){
		elem.transform = {};
	}
	if(arguments.length > 2){
		elem.transform[attr] = val;
		var sVal = '';
		for(var i in elem.transform){
			switch(i){
				case 'translateX':
				case 'translateY':
					sVal += i + '(' + elem.transform[i] + 'px) ';
					break;
				case 'scaleX':
				case 'scaleY':
				case 'scale':
					sVal += i + '(' + elem.transform[i] + ') ';
					break;
				case 'rotate':
				case 'skewX':
				case 'skewY':
					sVal += i + '(' + elem.transform[i] + 'deg) ' ;
					break;
			}
			elem.style.WebKitTransform = elem.style.transform = sVal;
		}
	}else{
		val = elem.transform[attr];
		if(typeof val == 'undefined'){
			if(attr == 'scale' || attr == 'scaleX' || attr == 'scaleY'){
				val = 1;
			}else{
				val = 0;
			}
		}
		return val;
	}
}