ig.module(
	'game.entities.ai'
)
.requires(
	'impact.entity'

)
.defines(function(){

EntityAI = ig.Entity.extend({
    
		size: {x: 32, y:32},
		zIndex: 500,
		gravityFactor: 0,
		
	
		type: ig.Entity.TYPE.NONE, // Player friendly group
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.NEVER,
		
		animSheet: new ig.AnimationSheet( 'media/enemy_tileset.png',32, 32),

			
		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			// Add the animations
			this.addAnim( 'idle_down', 1, [0] );
			this.addAnim( 'walk_down', 0.15, [0, 1, 0, 2] );
			this.addAnim( 'idle_side', 1, [3] );
			this.addAnim( 'walk_side', 0.15, [3,4,5] );
			this.addAnim( 'walk_up', 0.15, [6,7,6,8] );
			this.addAnim( 'idle_up', 0.15, [6] );
			this.addAnim( 'attack', 0.15, [9, 10] );

			this.attackTimer = new ig.Timer(0);
			//this.addAnim( 'selected', 1, [this.firstAnimationFrame+1] );
		},

		strike: function(){
			this.currentAnim = this.anims.attack;
			this.currentAnim.rewind();
			this.attackTimer = new ig.Timer(0.5);
		},

		setAnimation: function(){
			if(this.vel.x > 0){
				this.currentAnim = this.anims.walk_side;
				this.flip = false;
			} else if (this.vel.x < 0){
				this.currentAnim = this.anims.walk_side;
				this.flip = true;
			} else if (this.vel.y > 0){
				this.currentAnim = this.anims.walk_down;
			} else if (this.vel.y < 0){
				this.currentAnim = this.anims.walk_up;
			} else {
				this.currentAnim = this.anims.idle_down;
			}
		},
		
    
		update: function() {
			if(this.attackTimer.delta()<0){
				this.currentAnim = this.anims.attack;
			}else {
				this.setAnimation();
			}
			
			this.currentAnim.flip.x = this.flip;
			// move!
			this.parent();
			
		}
	});
});
