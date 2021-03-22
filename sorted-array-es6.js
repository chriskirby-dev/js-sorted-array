//Gets span of two number array
function span( v, abs ){ return Math.abs( v[0] - v[1] ) };

class SortedArray extends Array{


    defined = {};

    constructor( items=[], order="acs" ){
        super(); 
        this.defined.order = order;
    }

    set order( dir="acs" ){
        this.defined.order = dir;
        if( this.defined.order == 'asc' )
        this.sort(function(a, b){return a-b});
        else
        this.sort(function(a, b){return b-a});
    }

    get order(){
        return this.defined.order;
    }

    push( ...items ){
        const resp = [];
        for( let i=0;i<items.length;i++ ){
            resp.push( this.insert( items[0] ) );
        }
        return resp;
    }

    get first(){
        return this[0];
    }

    get last(){
        return this[this.length-1];
    }

    find( value ){
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

    
    findIndex( value, align='left', debug ){

        const self = this;
        if(debug)  console.log('findIndex', value, align, self.order );

        //Handel Empty Data 
        if( !self.length ) return 0;

        //Handel value higher or lower then first/last
        if(self.order == 'asc'){
            if( value < self[0] ) return 0;
            if( value > self[self.last] ) return self.last;
        }else{
            if( value > self[0] ) return 0;
            if( value < self[self.last] ) return self.last;
        }

        //Handel Single item in data
        if( self.length == 1 ){
            return self.order == 'asc' ? 
            ( self[0] > value ? 0 : 1 ) : ( self[0] < value ? 0 : 1 );
        }

        //Set start and end indexes of searchable array.
        var index = [ 0, self.length-1 ];
        //Set start and end values of searchable array.
        var values = [ self.first, self.last ];

        //index Span
        let indexSpan = span( index );
        //Value Span
        let valueSpan = span( values );


        let lastPrediction = null;
        var count = 0;
        while( indexSpan > 1 ){
            if(debug) console.log('Index', index[0], index[1], 'Values', values[0], values[1]);
            
            //Get Percent Point of Value to Number Span 
            var percent = span( [value, values[0]] )/valueSpan;

            //Based on percent predict the value index.
            var prediction;
            if( percent > 0.5 ){
                prediction = index[0] + Math.floor( percent * indexSpan );
            }else{
                prediction = index[1] - Math.floor( (1-percent) * indexSpan );
            }

            //If not first iteration and prediction = lastPrediction
            if( lastPrediction !== null && lastPrediction === prediction ){
                console.log('lastPrediction Same', prediction );
                if( prediction == index[0] ) prediction++;
                else if( prediction == index[1] ) prediction--;
            }

            //Get predicted value
            var predicted = self[prediction];
            
            //Determine Placement
            if( predicted == value ) return prediction;

            //Find Replacement Key
            const key = self.order == 'asc' ? 
            ( predicted > value ? 1 : 0 ) : ( predicted > value ? 0 : 1 );
        
            //Set Replacement Values
            index[key] = prediction;
            values[key] = predicted; 

            //Set Last Prediction
            lastPrediction = prediction;

            //Recalculate Spans
            indexSpan = span( index );
            valueSpan = span( values );

            //Count Iterations
            count++;
        }


        var index = align == 'left' ? index[0] : index[1];
        if( debug ) console.log(index, '--> #', count);
        return index;
    }

    indexRange( start, end ){
        return [ !start ? 0 : this.find( start ), !end ? this.length : this.find( end ) ];
    };
    
    insert = function( value ){
        var index;
        value = Number( value );
        if( this.has( value ) ) return false;
        else if( this.length == 0 ) this.push( value );

        const index = this.findIndex( value, 'right' );
    
        if( index === 0 ) this.unshift( value );
        else if( index == this.length ) this.push( value );
        else this.splice( index, 0, value );
        
        return index;
    };
    
    clear(){
        while(this.length > 0) this.shift();
        return this.length ? false : true;
    };
    
    
    has = function( value ){
        return this.indexOf( value ) === -1 ? false : true;
    };
    
    remove( value ){
        var i = this.indexOf( value );
        this.splice( i, 1 );
        return i;
    };
    

}
