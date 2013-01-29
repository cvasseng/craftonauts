ig.module(
	'game.entities.heart'
)
.requires(
	'impact.entity'

)
.defines(function(){

EntityHeart = ig.Entity.extend({

		
    
		size: {x: 64, y:64},
		zIndex: 1000,
		gravityFactor: 0,
		heartTime: 5,
	
		type: ig.Entity.TYPE.NONE, // Player friendly group
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.NEVER,
		
		animSheet: new ig.AnimationSheet( 'media/heart.png', 64, 64),

			
		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			// Add the animations
			this.addAnim( 'idle', 0.12, [0,1,2,3,4,0,1], true);
			//this.addAnim( 'selected', 1, [this.firstAnimationFrame+1] );
			this.currentAnim = this.anims.idle;
			this.heartTimer = new ig.Timer(this.heartTime * this.player.pulse);
			ig.game.sortEntitiesDeferred();
		},
		
    
		update: function() {
			// move!
			if(this.heartTimer.delta()>0){
				ig.game.sfxHeart.play();
				this.heartTimer.set(this.heartTime * this.player.pulse);
				this.currentAnim.rewind();
			}
			this.pos.x = ig.game.screen.x + 15;
			this.pos.y = ig.game.screen.y + 15;
			this.parent();
			
		}
	});
});
