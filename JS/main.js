function init(){
    var game = new Phaser.Game(800,490,Phaser.AUTO,'viewport');

    // Creates a new 'main' state that will contain the game
    var main_state = {
        preload: function() { 
            // Function called first to load all the assets
            // Change the background color of the game
            this.game.stage.backgroundColor = '#bbe3e8';
            
            // Load the bird sprite
            this.game.load.image('rollator', './IMG/senior_65px.png');
            this.game.load.image('pill','./IMG/pill.png');
            this.game.load.image('bg_clouds','./IMG/bg_clouds.png');
        },
        create: function() { 
            // Fuction called after 'preload' to setup the game
            // Display the bird on the screen
            this.bg_clouds = game.add.sprite(0, 0, 'bg_clouds');
            this.bird = this.game.add.sprite(100, 245, 'rollator');
            this.pipes = game.add.group();  
            this.pipes.createMultiple(20, 'pill');
            
            
            // Add gravity to the bird to make it fall
            this.bird.body.setRectangle(50,50,7.5,7.5);
            this.bird.body.gravity.y = 1000;
            
            // Call the 'jump' function when the spacekey is hit
            var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            space_key.onDown.add(this.jump, this);
            
            this.timer = this.game.time.events.loop(1500, this.add_row_of_pipes, this);
            
            this.score = 0;  
            var style = { font: "30px Arial", fill: "#ffffff" };  
            this.label_score = this.game.add.text(20, 20, "0", style);
            myAudio.play();
        },
    
        update: function() {
            // Function called 60 times per second
            // If the bird is out of the world (too high or too low), call the 'restart_game' function  
            if (this.bg_clouds.x <-700) {
                this.bg_clouds.x = 0;
            }
            else{
                this.bg_clouds.x -=1;
            }
            
            if (this.bird.inWorld == false)
            this.restart_game();
            
            this.game.physics.overlap(this.bird, this.pipes, this.restart_game, null, this);
        },
            
        jump: function() {  
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;
        },
        
        // Restart the game
        restart_game: function() {  
            // Start the 'main' state, which restarts the game
            this.game.state.start('main');
            this.game.time.events.remove(this.timer);
            myAudio.currentTime = 0;
        },
        
        add_one_pipe: function(x, y) {  
            // Get the first dead pipe of our group
            var pipe = this.pipes.getFirstDead();
        
            // Set the new position of the pipe
            pipe.reset(x, y);
        
            // Add velocity to the pipe to make it move left
            pipe.body.velocity.x = -400; 
        
            // Kill the pipe when it's no longer visible 
            pipe.outOfBoundsKill = true;
        },
        
        add_row_of_pipes: function() {  
        var hole = Math.floor(Math.random()*5)+1;
        this.score += 1;  
        this.label_score.content = this.score;  
        
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole +1) 
                this.add_one_pipe(800, i*60+10);   
        },
        
    };
    game.state.add('main',main_state);
    game.state.start('main');
}

function isPixelCollision( first, other, isCentred ){
    var i = 0;
    
    for(i = 0; i < other.length;i++){
    // we need to avoid using floats, as were doing array lookups
    x  = Math.round( first.position.x );
    y  = Math.round( first.position.y );
    x2 = Math.round( other.getAt(i).position.x );
    y2 = Math.round( other.getAt(i).position.y );

    var w  = first.width,
        h  = first.height,
        w2 = other.width,
        h2 = other.height ;

    // deal with the image being centred
    if ( isCentred ) {
        // fast rounding, but positive only
        x  -= ( w/2 + 0.5) << 0
        y  -= ( h/2 + 0.5) << 0
        x2 -= (w2/2 + 0.5) << 0
        y2 -= (h2/2 + 0.5) << 0
    }
    
    // find the top left and bottom right corners of overlapping area
    var xMin = Math.max( x, x2 ),
        yMin = Math.max( y, y2 ),
        xMax = Math.min( x+w, x2+w2 ),
        yMax = Math.min( y+h, y2+h2 );
    
    // Sanity collision check, we ensure that the top-left corner is both
    // above and to the left of the bottom-right corner.
    if ( xMin >= xMax || yMin >= yMax ) {
        return false;
    }
    
    var xDiff = xMax - xMin,
    yDiff = yMax - yMin;

    // get the pixels out from the images
    var pixels  = first.data,
        pixels2 = other.data;
    //the actual comparison
    for ( var pixelX = xMin; pixelX < xMax; pixelX++ ) {
        for ( var pixelY = yMin; pixelY < yMax; pixelY++ ) {
        if (
        ( pixels [ ((pixelX-x ) + (pixelY-y )*w )*4 + 3 ] !== 0 ) &&
        ( pixels2[ ((pixelX-x2) + (pixelY-y2)*w2)*4 + 3 ] !== 0 )
        ) {
            return true;
        }
        }
    }
    return false;
    }
}
