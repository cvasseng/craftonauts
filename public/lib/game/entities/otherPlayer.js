ig.module(
	'game.entities.otherPlayer'
)
.requires(
	'impact.entity'

)
.defines(function(){

EntityOtherPlayer = ig.Entity.extend({
    
		size: {x: 12, y:24},
		offset: {x: 10, y: 4},
		zIndex: 500,
		gravityFactor: 0,
		dead: false,
	
		type: ig.Entity.TYPE.NONE, // Player friendly group
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.NEVER,
		
		animSheet: new ig.AnimationSheet( 'media/player_tileset.png',32, 32),

			
		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			// Add the animations
			this.addAnim( 'idle_down', 1, [0] );
			this.addAnim( 'walk_down', 0.15, [1,0,2,0] );
			this.addAnim( 'idle_side', 1, [3] );
			this.addAnim( 'walk_side', 0.1, [5,5,3,4] );
			this.addAnim( 'walk_up', 0.15, [6,8,7,8] );
			this.addAnim( 'idle_up', 1, [8] );

			this.addAnim( 'idle_down_shank', 1, [16] );
			this.addAnim( 'walk_down_shank', 0.15, [17,16,18,16] );
			this.addAnim( 'idle_side_shank', 1, [19] );
			this.addAnim( 'idle_up_shank', 1, [22] );
			this.addAnim( 'walk_side_shank', 0.15, [19,21] );
			this.addAnim( 'walk_up_shank', 0.15, [22,24,23,24] );
			this.addAnim( 'attack_down_shank', 0.15, [25,26,27], true );
			this.addAnim( 'attack_side_shank', 0.15, [28,29], true );
			this.addAnim( 'attack_up_shank', 0.15, [30,31], true );
			this.addAnim( 'hit', 0.1, [48,49] );
			this.hitTimer = new ig.Timer(0);

			this.attackTimer = new ig.Timer(0);
			//this.addAnim( 'selected', 1, [this.firstAnimationFrame+1] );
		},

		die: function(){
			this.currentAnim = this.anims.die;
			this.currentAnim.rewind();
			this.dead = true;
		},

		hit: function(){
			this.hitTimer = new ig.Timer(0.5);
		},

		strike: function(){
			this.currentAnim = this.anims.attack_down_shank;
			this.currentAnim.rewind();
			this.attackTimer = new ig.Timer(0.5);
		},

		setAnimation: function(){
			if(this.shank){
				if(this.attackTimer.delta()<0){
					if(this.direction === 'up'){
						this.currentAnim = this.anims.attack_up_shank;
					} else if(this.direction === 'down'){
						this.currentAnim = this.anims.attack_down_shank;
					} else if(this.direction === 'left'){
						this.currentAnim = this.anims.attack_side_shank;
						this.flip = true;
					} else if(this.direction === 'right'){
						this.currentAnim = this.anims.attack_side_shank;
						this.flip = false;
					}
				} else if(this.vel.x > 0){
					this.direction = 'right';
					this.currentAnim = this.anims.walk_side_shank;
					this.flip = false;
				} else if (this.vel.x < 0){
					this.direction = 'left';
					this.currentAnim = this.anims.walk_side_shank;
					this.flip = true;
				} else if (this.vel.y > 0){
					this.direction = 'down';
					this.currentAnim = this.anims.walk_down_shank;
				} else if (this.vel.y < 0){
					this.direction = 'up';
					this.currentAnim = this.anims.walk_up_shank;
				} else {
					if(this.direction === 'left'){
						this.currentAnim = this.anims.idle_side_shank;
						this.flip = true;
					} else if (this.direction === 'right'){
						this.currentAnim = this.anims.idle_side_shank;
						this.flip = false;
					} else if (this.direction === 'up'){
						this.currentAnim = this.anims.idle_up_shank;
					} else if (this.direction === 'down'){
						this.currentAnim = this.anims.idle_down_shank;
					} else {
						this.currentAnim = this.anims.idle_down_shank;
					}
				}
			} else {
				if(this.vel.x > 0){
					this.currentAnim = this.anims.walk_side;
					this.direction = 'left';
					this.flip = false;
				} else if (this.vel.x < 0){
					this.currentAnim = this.anims.walk_side;
					this.direction = 'right';
					this.flip = true;
				} else if (this.vel.y > 0){
					 this.direction = 'down';
					this.currentAnim = this.anims.walk_down;
				} else if (this.vel.y < 0){
					this.direction = 'up';
					this.currentAnim = this.anims.walk_up;
				} else {
					if(this.direction === 'left'){
						this.currentAnim = this.anims.idle_side;
						this.flip = true;
					} else if (this.direction === 'right'){
						this.currentAnim = this.anims.idle_side;
						this.flip = false;
					} else if (this.direction === 'up'){
						this.currentAnim = this.anims.idle_up;
					} else if (this.direction === 'down'){
						this.currentAnim = this.anims.idle_down;
					}
				}
			}
		},
		
		draw: function(){
			this.parent();
			ig.game.font.draw(this.nickname, this.pos.x + 16 - ig.game.screen.x, this.pos.y -ig.game.screen.y- 20, ig.Font.ALIGN.CENTER);
		},
    
		update: function() {
			if(this.attackTimer.delta()<0){
				this.currentAnim = this.anims.attack_down_shank;
			} else if(this.dead){
				this.currentAnim = this.anims.die;
			} else {
				this.setAnimation();
			}
			
			
			this.currentAnim.flip.x = this.flip;
			// move!
			this.parent();
			
		}
	});
});
