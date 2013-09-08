var Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Touch, UI")
        .setup({ maximize: true })
        .controls()
        
Q.Sprite.extend("Player",{
  init: function(p) {
    this._super(p, { sheet: "player", x: 410, y: -50, valuation: 100 });
    this.add('2d, platformerControls');
    
    this.on("hit.sprite",function(collision) {
      if(collision.obj.isA("Tower")) {
        Q.stageScene("endGame",1, { label: "You Won!" }); 
        this.destroy();
      }
    });
  }
});

var player;

Q.UI.Text.extend("Valuation",{ 
  init: function(p) {
      this.x = 100;
      this.y = 100;
    this._super({
      label: "Equity: 0",
    });
    // this.valuation(0);
    Q.state.on("change.valuation",this,"valuation");
  },
  
  position: function() {
    if(this.stage.viewport) {
      this.p.x = this.stage.viewport.x + this.x;
      this.p.y = this.stage.viewport.y + this.y;
    }
  },

  step: function(dt) {
    this.position();
  },
  
  valuation: function(valuation) {
      this.p.label = "Equity: $" + Math.floor(valuation);
      
      if(valuation > 1000000000) {
            Q.stageScene("endGame",1,{label: "Congratulations, you can IPO."});
    }
  }
});

Q.UI.Text.extend("Cash",{ 
    
  init: function(p) {
      this.x = 100;
      this.y = 120;
    this._super({
      label: "Cash: $0",
    });
    Q.state.on("change.cash",this,"cash");
  },
  
  position: function() {
      if(this.stage.viewport) {
        this.p.x = this.stage.viewport.x + this.x;
        this.p.y = this.stage.viewport.y + this.y;
      }
    },

    step: function(dt) {
      this.position();
    },

  cash: function(cash) {
      this.p.label = "Cash: $" + Math.floor(cash);
      
      if(cash < 1) {
          Q.stageScene("endGame",1,{label: "You ran out of money! Better luck next time."});
      }
      
  }
});

setInterval(function() {
    if(Q.state.get("cash") > 0) {
        Q.state.dec("cash",Q.state.get("burndown"));
    }
}, 1);

Q.Sprite.extend("Startup",{
  init: function(p) {
    this._super(p, Q._defaults(p,{ sheet: 'enemy', vx: 100 }));
    this.add('2d, aiBounce');
    
    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) {
          
          if(Q.state.get("valuation")*10000 < this.p.valuation ) {
              Q.stageScene("endGame",1,{label: "They bought you out! Is this winning?"});
              this.destroy();
          } else if(Q.state.get("cash") > this.p.valuation) {
              Q.state.dec("cash",this.p.valuation);
              Q.state.inc("valuation",this.p.valuation);
              this.destroy();
          }
      }
    });
    
    this.on("bump.top",function(collision) {
      if(collision.obj.isA("Player")) { 
        collision.obj.p.vy = -300;
      }
    });
  }
});

Q.Startup.extend("Twilio", {
    init: function(p) {
        p = Q._defaults(p, {sheet: 'twilio', vx: 200, valuation: 20000000});
        this._super(p);
    }
});

Q.Startup.extend("Venmo", {
    init: function(p) {
        p = Q._defaults(p, {sheet: 'venmo', vx: 200, valuation: 200000000});
        this._super(p);
    }
});

Q.Startup.extend("Facebook", {
    init: function(p) {
        p = Q._defaults(p, {sheet: 'facebook', valuation: 50000000000});
        this._super(p);
    }
});

Q.Startup.extend("Google", {
    init: function(p) {
        p = Q._defaults(p, {sheet: 'google', valuation: 600000000000});
        this._super(p);
    }
});

Q.Startup.extend("Microsoft", {
    init: function(p) {
        p = Q._defaults(p, {sheet: 'microsoft', vx: 80, valuation: 600000000000});
        this._super(p);
    }
});

Q.Startup.extend("Apple", {
    init: function(p) {
        p = Q._defaults(p, {sheet: 'apple', valuation: 600000000000});
        this._super(p);
    }
});

Q.Sprite.extend("VC",{
  init: function(p) {
    this._super(p, Q._defaults(p,{ sheet: 'twilio', cash: 100 }));
    
    this.on("hit.sprite",function(collision) {
      if(collision.obj.isA("Player")) { 
          Q.state.set("burndown", Math.floor(this.p.cash / 5000));
          Q.state.dec("valuation", Q.state.get("valuation") * this.p.equity);
          Q.state.inc("cash",this.p.cash);
          this.destroy();
      }
    });
  }
});

Q.VC.extend("YC",{
  init: function(p) {
      p = Q._defaults(p, {sheet: 'yc', cash: 17000, equity: 0.07});
      this._super(p);
  }
});

Q.VC.extend("TechStars",{
  init: function(p) {
      p = Q._defaults(p, {sheet: '500s', cash: 18000, equity: 0.05});
      this._super(p);
  }
});

Q.VC.extend("USV",{
  init: function(p) {
      p = Q._defaults(p, {sheet: 'usv', cash: 90000000, equity: 0.15});
      this._super(p);
  }
});

Q.Sprite.extend("Round",{
  init: function(p) {
    this._super(p, Q._defaults(p,{ sheet: 'tower' }));
    
    this.on("hit.sprite",function(collision) {
      if(collision.obj.isA("Player")) { 
          Q.stageScene(this.p.scene);
      }
    });
  }
});

Q.Round.extend("Ender",{
  init: function(p) {
    this._super(p, Q._defaults(p,{}));
    
    this.on("hit.sprite",function(collision) {
      if(collision.obj.isA("Player")) { 
          Q.stageScene("endGame",1,{label: "Congratulations, you can IPO."});
        }
    });
  }
});


// scenes
var valuation;
var cash;

Q.scene("level1",function(stage) {
  stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level.json', sheet: 'tiles' }));
  player = stage.insert(new Q.Player());
    
  stage.add("viewport").follow(player);
  
  stage.insert(valuation = new Q.Valuation());
  stage.insert(cash = new Q.Cash());
    
  stage.insert(new Q.YC({ x: 820, y: 78}));
  stage.insert(new Q.Venmo({ x: 900, vx: 50, y: 78}));
  stage.insert(new Q.Round({scene:'level2', x:180, y:47}));
  // stage.insert(new Q.Round({scene:'level3', x:500, y:200}));
  
  Q.state.set({ valuation: 10000, cash: 20000, burndown: 5 })
  
});

Q.scene("level2",function(stage) {
  stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level2.json', sheet: 'tiles' }));
  
  stage.insert(player);
  player.p.x = 190;
  player.p.y = 0;
  
  Q.unpauseGame();
  
  stage.add("viewport").follow(player);
  
  stage.insert(new Q.Valuation());
  stage.insert(new Q.Cash());
    
  stage.insert(new Q.TechStars({ x: 690, y: 15}));
  stage.insert(new Q.Google({ x: 600, vx: 100, y: 10}));
  stage.insert(new Q.Facebook({ x: 800, vx: 100, y: 10}));
  
  stage.insert(new Q.Round({scene:'level3', x:1070, y:178}));
  
  Q.state.inc("valuation",1);
  Q.state.dec("valuation",1);
  
});

Q.scene("level3",function(stage) {
  stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level3.json', sheet: 'tiles' }));
  
  stage.insert(player);
  player.p.x = 140;
  player.p.y = 0;
  
  Q.unpauseGame();
  
  stage.add("viewport").follow(player);
  
  stage.insert(new Q.Valuation());
  stage.insert(new Q.Cash());


  stage.insert(new Q.Twilio({ x: 430, y: 15}));
  stage.insert(new Q.USV({ x: 525, y: 15}));
  stage.insert(new Q.Microsoft({ x: 790, y: 10}));
  stage.insert(new Q.Apple({ x: 800, vx: 150, y: 10}));
  
  Q.state.inc("valuation",1);
  Q.state.dec("valuation",1);
  
  stage.insert(new Q.Ender({x:1070, y:178}));
  
});

Q.scene('endGame',function(stage) {
  var box = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));
  
  player.destroy();

  var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                           label: "Play Again" }))         
  var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                        label: stage.options.label }));
  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('level1');
    // Q.unpauseGame();
  });
  box.fit(20);
});

Q.load("sprites.png, sprites.json, level.json, level2.json, level3.json, tiles.png", function() {
  Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });
  Q.compileSheets("sprites.png","sprites.json");
  Q.stageScene("level1");
});