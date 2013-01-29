ig.module(
	'game.entities.item'
)
.requires(
	'impact.entity'

)
.defines(function(){

EntityItem = ig.Entity.extend({
    
		size: {x: 32, y:32},
		zIndex: 400,
		gravityFactor: 0,
		
	
		type: ig.Entity.TYPE.NONE, // Player friendly group
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.NEVER,
		
		animSheet: new ig.AnimationSheet( 'media/player_tileset.png', 32, 32),

			
		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			//Load sprite
			this.animSheet = new ig.AnimationSheet( 'media/' + settings.meta.sprite, 32, 32);

			// Add the animations
			this.addAnim( 'idle', settings.meta.animations.idle.speed, settings.meta.animations.idle.frames);
			//this.addAnim( 'selected', 1, [this.firstAnimationFrame+1] );

			ig.game.sortEntitiesDeferred();
		},
		
    
		update: function() {
		
			this.currentAnim = this.anims.idle;
			
			this.currentAnim.flip.x = this.flip;
			
			// move!
			this.parent();
			
		}
	});
});
