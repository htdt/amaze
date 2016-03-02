    // this.audioListener = new THREE.AudioListener();
    // this.scene.add(this.audioListener);

    // this.sound2 = new THREE.PositionalAudio( this.audioListener );
    // this.sound2.load( '/media/sound/morphing.wav' );
    // this.sound2.setRefDistance( 10 );
    // this.sound2.autoplay = true;
    // this.sound2.setLoop(true);
    // this.sound2.setVolume(1);

    // this.sound1 = new THREE.PositionalAudio( this.audioListener );
    // this.sound1.load( '/media/sound/bg.wav' );
    // this.sound1.setRefDistance( 20 );
    // this.sound1.autoplay = true;
    // this.sound1.setLoop(true);
    // this.sound1.setVolume(.05);
    // this.player.add(this.sound1);

    // var test = new THREE.Mesh(
    //   new THREE.SphereGeometry(1,10,10),
    //   new THREE.MeshBasicMaterial()
    // );
    // this.sound1.add(test);

    // this.animator.play({
    //   func: dt => {
    //     this.audioListener.position.copy(this.player.position);
    //     this.audioListener.rotation.copy(this.camera.rotation);
    //     this.sound1.position.y = Math.sin(this.player.rotation.y)*30;
    //   },
    //   duration: 5000,
    //   loop: true
    // });