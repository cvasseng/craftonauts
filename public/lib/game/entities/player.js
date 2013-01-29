ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity',
	'game.entities.heart'

)
.defines(function(){

EntityPlayer = ig.Entity.extend({
    
		size: {x: 12, y:24},
		offset: {x: 10, y:4},
		zIndex: 500,
		gravityFactor: 0,
		baseSpeed: 60,
		speed: 60,
		flashlight: true,
		flip: false,
		shank: false,
		pulse: 1,
	
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
			this.addAnim( 'die', 0.1, [48,49,50,51,52,53,54], true );
			this.hitTimer = new ig.Timer(0);
			this.heart = ig.game.spawnEntity(EntityHeart, 15, 15, {player: this});
			this.attackTimer = new ig.Timer(0);
			//this.addAnim( 'selected', 1, [this.firstAnimationFrame+1] );
		},

		hit: function(){
			this.hitTimer = new ig.Timer(0.5);
		},

		die: function(){
			this.currentAnim = this.anims.die;
			this.currentAnim.rewind();
			this.dead = true;
			this.heart.kill();
		},

		strike: function(){
			if(this.direction === 'down'){
				this.currentAnim = this.anims.attack_down_shank;
			} else if (this.direction === 'left'){
				this.currentAnim = this.anims.attack_side_shank;
				this.flip = true;
			} else if (this.direction === 'right'){
				this.currentAnim = this.anims.attack_side_shank;
				this.flip = false;
			} else if (this.direction === 'up'){
				this.currentAnim = this.anims.attack_up_shank;
			}
			
			this.currentAnim.rewind();
			this.attackTimer = new ig.Timer(0.5);
			ig.game.sfxSwordHit.play();
		},

		handleMovementTrace: function( res ) {
		    // Continue resolving the collision as normal
		    this.parent(res);

		    if( res.collision.y) {
		        miner.setVelY(this.vel.y);
		    } else if (res.collision.x){
		    	miner.setVelX(this.vel.x);
		    }
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
					this.currentAnim = this.anims.walk_side_shank;
					this.flip = false;
				} else if (this.vel.x < 0){
					this.currentAnim = this.anims.walk_side_shank;
					this.flip = true;
				} else if (this.vel.y > 0){
					this.currentAnim = this.anims.walk_down_shank;
				} else if (this.vel.y < 0){
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
					this.flip = false;
				} else if (this.vel.x < 0){
					this.currentAnim = this.anims.walk_side;
					this.flip = true;
				} else if (this.vel.y > 0){
					this.currentAnim = this.anims.walk_down;
				} else if (this.vel.y < 0){
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
    
		update: function() {
			this.speed = this.baseSpeed;// - miner.stats.inventorySize;
			if(!this.dead){
				if(ig.input.pressed('left')){
					this.vel.x = -this.speed;
					miner.setVelX(this.vel.x);
					this.direction = 'left';
				} else if (ig.input.pressed('right')){
					this.vel.x = this.speed;
					miner.setVelX(this.vel.x);
					this.direction = 'right';
				} else if (ig.input.released('left') ){
					if(ig.input.state('right')){
						this.vel.x = this.speed;
						this.direction = 'right';
					}else {
						this.vel.x = 0;
					}
					miner.setVelX(this.vel.x);
				} else if (ig.input.released('right')){
					if(ig.input.state('left')){
						this.vel.x = -this.speed;
						this.direction = 'left';
					} else {
						this.vel.x = 0;
					}
					miner.setVelX(this.vel.x);
				}

				if (ig.input.pressed('down')){
					this.vel.y = this.speed;
					miner.setVelY(this.vel.y);
					this.direction = 'down';
				} else if (ig.input.pressed('up')){
					this.vel.y = -this.speed;
					miner.setVelY(this.vel.y);
					this.direction = 'up';
				} else if (ig.input.released('up') || ig.input.released('down')){
					this.vel.y = 0;
					miner.setVelY(this.vel.y);
				}

				if(ig.input.pressed('bomb')){
					miner.blowUp();
				}

				if (ig.input.pressed('drop')) {
					miner.dropItem();
				}

				if(ig.input.pressed('flashlight')){
					miner.toggleFlashlight();
					ig.game.sfxClick.play();
					//this.flashlight = !this.flashlight;
				}

				if (ig.input.pressed('interact')) {
					miner.interactWithWorld();
				}

				if (ig.input.pressed('use')) {
					miner.useItem();
				}
			}

			if(this.pos.x < 0){
				this.pos.x = 0;
			} else if (this.pos.x > 499*32){
				this.pos.x = 499*32;
			}

			if(this.pos.y < 0){
				this.pos.y = 0;
			} else if (this.pos.y > 499*32){
				this.pos.y = 499*32;
			}

			if(this.hitTimer.delta()<0){
				this.currentAnim = this.anims.hit;
			} else  if(this.dead){
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
