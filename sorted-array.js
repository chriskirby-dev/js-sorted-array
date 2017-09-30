
'use strict';

var defineProp = function( obj, prop, get, set ){
	if(!set) set = function(){ return false; };
	Object.defineProperty( obj, prop, {
		get: get,
		set: set
	});
}

var cancelEvent = function(){
    return false;	
}

var SortedArray = function( order ){
    var self = this;
    self.order = 'ASC';
    if(order) self.order = order.toUpperCase();

    Object.defineProperty( self, 'first', {
        get: function(){
            return self[0];
        },
        set: cancelEvent
    });

    Object.defineProperty( self, 'last', {
        get: function(){
            return self[self.length-1];
        },
        set: cancelEvent
    });

    if( self.order == 'DESC' ){
        defineProp( self, 'max', function(){ return self[0] } );
        defineProp( self, 'min', function(){ return self[self.length-1] } );
    }else{
        defineProp( self, 'min', function(){ return self[0] } );
        defineProp( self, 'max', function(){ return self[self.length-1] } );
    }

};

SortedArray.prototype = Object.create( Array.prototype );
SortedArray.prototype.constructor = SortedArray;

SortedArray.prototype.find = function( value ){
    var self = this;
    var index = self.indexOf( value );
    if( index === -1 ){
        if( self.order == 'ASC' ){
            if( value <= self.first ) index = 0;
            else if( value >= self.last ) index = self.length;
            else index = self.findIndex( value );
        }else{
            if( value >= self.first ) index = 0;
            else if( value <= self.last ) index = self.length;
            else index = self.findIndex( value );
        }
    }
    return index;
};

SortedArray.prototype.findIndex = function( value, align, debug ){

    var self = this;
    if(debug)  console.log('findIndex', value, align, self.order );
    if( !self.first ) return 0;

    if(self.order == 'ASC'){
        if( value < self[0] ) return 0;
        if( value > self[self.last] ) return self.last;
    }else{
        if( value > self[0] ) return 0;
        if( value < self[self.last] ) return self.last;
    }

    if( self.length == 1 ){
        if(self.order == 'ASC')
        return self[0] > value ? 0 : 1;
        else 
        return self[0] < value ? 0 : 1;
    }
    //Gets span of two number array
    var span = function( v, abs ){ return Math.abs( v[0] - v[1] ); };
    //Index: span of scoped array indexes
    var index = [ 0, self.length-1 ];
    //Values: first and last scoped values 
    var values = [ self.first, self.last ];
    //console.log( 'First',  values );
    //index Span
    var ispan = span( index );
    //Value Span
    var dspan = span( values );
    // console.log( 'IS', ispan, 'DS',dspan );
    var lp = null;
    var count = 0;
    while( ispan > 1 ){
        if(debug) console.log('Index', index[0], index[1], 'Values', values[0], values[1]);
        //Dist From Start
        var percent = Math.max( Math.min( span([value, values[0]])/dspan, 1 ), 0);
        var predict;
        //predict = index[0] + Math.floor( percent * ispan );
        if( percent > 0.5 ){
            predict = index[0] + Math.floor( percent * ispan );
            //predict = Math.max( index[0]+1, Math.min( predict, index[1]-1 ) );
        }else{
            predict = index[1] - Math.floor( (1-percent) * ispan );
        }
        //console.log('LP', lp);
        if( lp !== null && lp === predict ){
            console.log('LP Same', predict );
            if( predict == index[0] ) predict++;
            else if( predict == index[1] ) predict--;
        }

        var predicted = self[predict];
            if(debug) console.log( 'LP', lp, 'predict', predict, 'predicted', predicted);
        //Determine Placement
        if( predicted == value ) return predict;

        if( self.order == 'ASC' ){
            var key = 0;
            if( predicted > value ) key = 1;
        }else{
            var key = 1;
            if( predicted > value ) key = 0;
        }

        index[key] = predict;
        values[key] = predicted; 

        lp = predict;
        //Reset Spans
        ispan = span( index );
        dspan = span( values );
        count++;
    }
    var index = align == 'LEFT' ? index[0] : index[1];
    if( debug ) console.log(index, '--> #', count);
    return index;
};

SortedArray.prototype.findAll = function( start, end ){
    var self = this;
    return [ !start ? 0 : self.find( start ), !end ? self.length : self.find( end ) ];
};

SortedArray.prototype.add = function( v ){
    var self = this;
    var index;
    v = Number( v );
    if( self.indexOf( v ) !== -1 ) return false;
    else if( self.length == 0 ) self.push( v );
    else if( self.order == 'ASC' ){
        if( v < self.first ) self.unshift( v );
        else if( v > self.last ) self.push( v );
        else self.splice( self.findIndex( v, 'RIGHT' ), 0, v );
    }else{
        if( v > self.first ) self.unshift( v );
        else if( v < self.last ) self.push( v );
        else self.splice( self.findIndex( v, 'RIGHT' ), 0, v );
    }
    return false;
};

SortedArray.prototype.clear = function(){
    var self = this;
    while(self.length > 0){
        self.shift();
    }
    return false;
};


SortedArray.prototype.has = function( v ){
    return this.indexOf( v ) === -1 ? false : true;
};

SortedArray.prototype.remove = function( v ){
    var i = this.indexOf( v );
    this.splice( i, 1 );
    return i;
};
