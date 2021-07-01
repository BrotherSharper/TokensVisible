// TokensVisible.js
// (c) 2021 David Zvekic
// permission granted to use and distribute as per LICENSE file

"use strict";

import {moduleName, MODULE_ID ,registerSettings, tokensVisible} from './settings/settings.js';
import {libWrapper} from './libwrapper/shim.js'

tokensVisible.hoverToken= new Object();
tokensVisible.hoverToken.hoveredTarget=0;
tokensVisible.pushhotkey='';

tokensVisible.pushToBack=function() {

  if ( tokensVisible?.hoverToken?.hoveredTarget instanceof Token) { 
    const token = tokensVisible.hoverToken.hoveredTarget; 
    let position = 0;
    var foundchild;
    for (const x of canvas.tokens.children[0].children) {
       if (x==token) break;
       position++;
    }

    if (position<canvas.tokens.children[0].children.length){
      // found the child, push it to element 0
      canvas.tokens.children[0].children.splice(position,1);
      canvas.tokens.children[0].children.unshift(token);
    }
  }; 
};


tokensVisible.pushTokenBackListener = function(event){
	
    if (event.target !== document.body && event.target !== canvas.app.view) return;
    if ( event.isComposing || event.repeat) return;
    if (event.key==tokensVisible.pushhotkey ) tokensVisible.pushToBack();
    if (event.key==tokensVisible.castRayshotkey ) { 
		   
      switch(tokensVisible.currentCastRaysmode){
        case "Standard" :tokensVisible.setProperCastRays('Enhanced');
        break;
        case "Enhanced" :tokensVisible.setProperCastRays('Super');
        break;
        case "Super": tokensVisible.setProperCastRays('Standard');
        break;
        default:  tokensVisible.setProperCastRays('Enhanced'); 
      }
    }
  
    if (event.key==tokensVisible.sightCachehotkey ) { 
	   
      switch(tokensVisible.currentSightCacheMode){
        case "On" :tokensVisible.setProperSightCache('Off');
        break;
        case "Off" :tokensVisible.setProperSightCache('On');
        break;
        default:  tokensVisible.setProperSightCache('On'); 
      }
    }
};
 

tokensVisible.hoverToken.hook= Hooks.on('hoverToken',(token,hoverON)=>{
	
  if (hoverON) {
    tokensVisible.hoverToken.hoveredTarget=token;
  }
  else {
    delete tokensVisible.hoverToken.hoveredTarget;
  }
});

Hooks.once('init',async function () {
	console.log('TokensVisible | Initializing Your Tokens Visible');
	
    
	 
});

Hooks.once('ready',() => {
  		
   
	
  window.addEventListener('keydown', tokensVisible.pushTokenBackListener );
 
});


Hooks.on('updateWall', (scene,wall,data,diff,userid) => {
  if(diff.diff){
    if (tokensVisible.SightCache!=undefined) tokensVisible.SightCache=new Map();
  }
});

Hooks.on('canvasReady',()=>{ 
  if (tokensVisible.SightCache!=undefined) tokensVisible.SightCache=new Map();
} );

Hooks.once('canvasReady', () => {
		 
  	 tokensVisible.setProperCastRays(game.settings.get('TokensVisible', 'castRays'));
     tokensVisible.setProperSightCache(game.settings.get('TokensVisible', 'sightCache'));

});


tokensVisible.canvasInitializeSources= function() {
   if(canvas.perception?.initialize!=undefined)
       canvas.perception.initialize();   // Foundry VTT 0.8.6
   else
       canvas.initializeSources();     // Foundry 0.7.9
};
	


tokensVisible.setProperCastRays = function(value){
   switch (value){  
     case "Standard":tokensVisible._setStandardCastRays();
     break; 
     case "Enhanced": tokensVisible._setEnhancedCastRays();
     break; 
     case "Super": tokensVisible._setExtraEnhancedCastRays();
     break; 
     default: 
       tokensVisible._setStandardCastRays();  
       value="Standard";
   };
   
   tokensVisible.currentCastRaysmode=value;
   if (game.ready ) {
     ui.notifications.info( game.i18n.localize("TOKENSVISIBLE.castRays")+" : " + value );
     tokensVisible.canvasInitializeSources();
   } 


};


tokensVisible.setProperSightCache = function(value){
   switch (value){  
     case "On": tokensVisible.enableTurboSight();
     break; 
     case "Off": tokensVisible.disableTurboSight(); 
     break; 
     default: 
	    tokensVisible.disableTurboSight();
        value="Off";
   };
   
   tokensVisible.currentSightCacheMode=value;

   if (game.ready ) {
    	ui.notifications.info( game.i18n.localize("TOKENSVISIBLE.sightCache")+" : " + game.i18n.localize("TOKENSVISIBLE.sightCache" + value) );
    }

};

Hooks.once('renderSceneControls', function () {
registerSettings();
tokensVisible.panMode = game.settings.get('TokensVisible', 'panMode');
tokensVisible.pushhotkey=game.settings.get('TokensVisible', 'pushhotkey');
tokensVisible.autopanMargin= game.settings.get('TokensVisible', 'autopanningMargin');
tokensVisible.hiddenCanLight = game.settings.get('TokensVisible', 'hiddenCanLight');
tokensVisible.wallsCancelAnimation = game.settings.get('TokensVisible', 'wallsCancelAnimation');
tokensVisible.castRayshotkey =game.settings.get('TokensVisible', 'castRayshotkey');
tokensVisible.sightCachehotkey =game.settings.get('TokensVisible', 'sightCachehotkey');
tokensVisible.setupCombatantMasking(game.settings.get('TokensVisible', 'combatantHidden'));
}
);


function nameToHexA(name) {
	return RGBToHexA(nameToRGB(name));
}

function nameToRGB(name) {
  if (!name) return '';
  // Create fake div
  let fakeDiv = document.createElement("div");
  fakeDiv.style.color = name;
  document.body.appendChild(fakeDiv);

  // Get color of div
  let cs = window.getComputedStyle(fakeDiv),
      pv = cs.getPropertyValue("color");

  // Remove div after obtaining desired color value
  document.body.removeChild(fakeDiv);

  return pv;
}

function RGBToHexA(rgb) {
	if (rgb.startsWith('rgba')) return RGBAToHexA(rgb);
  // Choose correct separator
  let sep = rgb.indexOf(",") > -1 ? "," : " ";
  // Turn "rgb(r,g,b)" into [r,g,b]
  rgb = rgb.substr(4).split(")")[0].split(sep);

  let r = (+rgb[0]).toString(16),
      g = (+rgb[1]).toString(16),
      b = (+rgb[2]).toString(16);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b+'ff';
}


function RGBAToHexA(rgba) {
	
  let sep = rgba.indexOf(",") > -1 ? "," : " "; 
  rgba = rgba.substr(5).split(")")[0].split(sep);
                
  // Strip the slash if using space-separated syntax
  if (rgba.indexOf("/") > -1)
    rgba.splice(3,1);

  for (let R in rgba) {
    let r = rgba[R];
    if (r.toString().indexOf("%") > -1) {
      let p = r.substr(0,r.length - 1) / 100;

      if (R < 3) {
        rgba[R] = Math.round(p * 255);
      } else {
        rgba[R] = p;
      }
    }
  }
  
  let r = (+rgba[0]).toString(16),
      g = (+rgba[1]).toString(16),
      b = (+rgba[2]).toString(16),
      a = Math.round(+rgba[3] * 255).toString(16);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;
  if (a.length == 1)
    a = "0" + a;

  return "#" + r + g + b + a;
  
}
tokensVisible.defaultcolors= new Map();

tokensVisible.setupRenderColors = function() 
{
	
  if (tokensVisible.defaultcolors['toggleActiveFG']== undefined ) tokensVisible.defaultcolors['toggleActiveFG']  = $('li.control-tool.active.toggle').css('color'); 
  if (tokensVisible.defaultcolors['toggleActiveBG']== undefined ) tokensVisible.defaultcolors['toggleActiveBG']  = $('li.control-tool.active.toggle').css('background-color');
  if (tokensVisible.defaultcolors['activeFG']== undefined ) tokensVisible.defaultcolors['activeFG']  = $('li.control-tool.active:not(.toggle)').css('color');
  if (tokensVisible.defaultcolors['activeBG']== undefined ) tokensVisible.defaultcolors['activeBG']  = $('li.control-tool.active:not(.toggle)').css('background-color');
	
  setColor( 'toggleActiveFG', '#controls .control-tool.toggle.active', 'color' );
  setColor(  'toggleActiveBG','#controls .control-tool.toggle.active', 'background-color' );
  setColor(  'activeFG','#controls .control-tool.active:not(.toggle)', 'color' );
  setColor(  'activeBG', '#controls .control-tool.active:not(.toggle)', 'background-color' );


  function setColor( settingName, jQuerySpec, cssProperty){
  
  const colorValue=game.settings.get('TokensVisible', settingName);
  if ( colorValue && !(nameToHexA(colorValue).endsWith('00')) ) {
	       document.querySelectorAll(jQuerySpec).forEach(e=>e.style.setProperty(cssProperty,colorValue));
	      } else
	       document.querySelectorAll(jQuerySpec).forEach(e=>e.style.setProperty(cssProperty,tokensVisible.defaultcolors[settingName]  ));
  }	
 

};
  
Hooks.on('renderSceneControls', tokensVisible.setupRenderColors );



Hooks.once('ready', () => {
	

   libWrapper.register(moduleName,'Token.prototype.isVisible', 
	function()  
  	{
      if (!canvas.sight.tokenVision && !this.data.hidden) return true; 

	  if ( this._controlled ) return true;
	  if(!game.user.isGM ){
	   const canObserve = this.actor && this.actor.hasPerm(game.user, "OBSERVER");
	   if (canObserve) return true;
      }
	
	 if ( this.data.hidden && !game.user.isGM )  return false; 
	 // if we get here then the token's visibility depends on whether it is 
	 // visible via line of sight, field of view and lighting to another token that gives us vision
	  const tolerance = Math.min(this.w, this.h) / 4;
      return canvas.sight.testVisibility(this.center, {tolerance, object: this});
	}, 'OVERRIDE');
	
   libWrapper.register(moduleName,'Token.prototype._isVisionSource', 
    function () {
       if ( !canvas.sight.tokenVision || !this.hasSight ) return false;
       if ( this._controlled ) return true;
 
       const isGM = game.user.isGM;
       if (!isGM) {
          // if a non-GM observer-user controls no tokens with sight return true
          const others = this.layer.controlled.find( t => !t.data.hidden && t.hasSight);
          if (this.observer && (others == undefined)) return true;
    
       }
	
   	   return false;
     }
	, 'OVERRIDE');
	
	 

 libWrapper.register(moduleName,'Token.prototype.setPosition',	 
	async function (x, y, {animate=true}={}) {
 
    // Create a Ray for the requested movement
    let origin = this._movement ? this.position : this._validPosition,
        target = {x: x, y: y},
        isVisible = this.isVisible;

    // Create the movement ray
    let ray = new Ray(origin, target);
	let cancelAnimation = false;
	if(animate){
	  if (tokensVisible.wallsCancelAnimation=="Always") cancelAnimation=true;
	  if (!cancelAnimation)
       cancelAnimation = (tokensVisible.wallsCancelAnimation=="Yes" &&  this.checkCollision(target)); 
    }
     this._validPosition = target;
     this._velocity = this._updateVelocity(ray);

    // Update visibility for a non-controlled token which may have moved into the controlled tokens FOV
    this.visible = isVisible;

    // Conceal the HUD if it targets this Token
    if ( this.hasActiveHUD ) this.layer.hud.clear();
 

    if ( animate){
		if (cancelAnimation) {
	     	// client with animate turned on assumes an animated Movement will render the destination.
    		// since we are setting the position directly, animate tiny distance Movement at the destination
			// to satisfy that need.
			// in Foundry 0.7.9 a 0 distance movement worked, but as of 0.8.6 we need a non-zero distance
	    	this.position.set(x-0.01, y-0.01);  

			await this.animateMovement(new Ray(this.position, ray.B));
        } 
		else
		 await this.animateMovement(new Ray(this.position, ray.B));
    }
	else this.position.set(x, y);
	
    // If the movement took a controlled token off-screen, adjust the view
    if (this._controlled && isVisible) {

      const pad = tokensVisible.autopanMargin;
     
	  
	  
	  if (tokensVisible.panMode=="Recenter") {
         let gp = this.getGlobalPosition();
	     if ((gp.x < pad) || (gp.x > window.innerWidth - pad) || (gp.y < pad) || (gp.y > window.innerHeight - pad)) {
  	    	canvas.animatePan(this.center);
         } 
      } else {
		  
		  async function relativePan({dx,dy}){
	 		  await canvas.animatePan({x:canvas.scene._viewPosition.x+dx, y: canvas.scene._viewPosition.y+dy})
		  };
		  
		  
		  let bounds = this.getBounds();
		  let dx = 0;
	  	  let dy = 0;

	      if ( bounds.x < pad ) {
     		  dx = bounds.x- pad;
	      } else
	      if ( ( bounds.x+bounds.width ) > ( window.innerWidth - pad ) ) {
		      dx = ( bounds.x + bounds.width ) - ( window.innerWidth - pad );
	      };
	
          if ( bounds.y < pad ){
			  dy = bounds.y - pad;
	      } else
		  if ( ( bounds.y + bounds.height) > ( window.innerHeight - pad ) ) {
               dy =  (bounds.y + bounds.height) - ( window.innerHeight - pad );
		  } ;
		  
		  if  (dx || dy){
			 await relativePan({dx,dy});
	      }
      }
    }
    return this;
}, 'OVERRIDE');



  
 libWrapper.register(moduleName,'Token.prototype.updateSource',	  
 function({defer=false, deleted=false, noUpdateFog=false}={}) {
	// this method is derived from original Token.prototype.updateSource 
    if ( CONFIG.debug.sight ) {
      SightLayer._performance = { start: performance.now(), tests: 0, rays: 0 }
    }

    // Prepare some common data
    const origin = this.getSightOrigin();
    const sourceId = this.sourceId;
    const d = canvas.dimensions;
	const maxR = (d.maxR!=undefined)?(d.maxR):(Math.hypot(d.sceneWidth, d.sceneHeight)); 

    // Update light source
	const isLightSource = this.emitsLight && ((tokensVisible.hiddenCanLight=="Yes") || (!this.data.hidden));

    if ( isLightSource && !deleted ) {
      const bright = Math.min(this.getLightRadius(this.data.brightLight), maxR);
      const dim = Math.min(this.getLightRadius(this.data.dimLight), maxR);
      this.light.initialize({
        x: origin.x,
        y: origin.y,
        dim: dim,
        bright: bright,
        angle: this.data.lightAngle,
        rotation: this.data.rotation,
        color: this.data.lightColor,
        alpha: this.data.lightAlpha,
        animation: this.data.lightAnimation
      });
      canvas.lighting.sources.set(sourceId, this.light);
      if ( !defer ) {
        this.light.drawLight();
        this.light.drawColor();
      }
    }
    else {
      canvas.lighting.sources.delete(sourceId);
      if ( isLightSource && !defer ) canvas.lighting.refresh();
    }

    // Update vision source
    const isVisionSource = this._isVisionSource();
    if ( isVisionSource && !deleted ) {
      let dim =  canvas.lighting.globalLight ? maxR : Math.min(this.getLightRadius(this.data.dimSight), maxR);
      const bright = Math.min(this.getLightRadius(this.data.brightSight), maxR);
	  //if ((dim === 0) && (bright === 0)) dim = Math.min(this.w, this.h) * 0.5;  // this line was part of 0.7.9 but I dont know why it is needed, and 0.8.6 removed it
      this.vision.initialize({
        x: origin.x,
        y: origin.y,
        dim: dim,
        bright: bright,
        angle: this.data.sightAngle,
        rotation: this.data.rotation
      });
      canvas.sight.sources.set(sourceId, this.vision);
      if ( !defer ) {
        this.vision.drawLight();
        canvas.sight.refresh({noUpdateFog});
      }
    }
    else {
      canvas.sight.sources.delete(sourceId);
      if ( isVisionSource && !defer ) canvas.sight.refresh();
    }
}, 'OVERRIDE');


}
);


 // the conditional assignment is for legacy 0.7.x support
tokensVisible.SightLayer = {_defaultcastRays : ((WallsLayer.castRays!=undefined) ? WallsLayer.castRays : SightLayer._castRays), 
	                        _defaultcomputeSight : ((WallsLayer.prototype.computePolygon !=undefined) ? WallsLayer.prototype.computePolygon:SightLayer.computeSight)
                           };
 // the conditional assignment is for legacy 0.7.x support						   
tokensVisible.Combat = {_defaultcreateEmbeddedEntity:  (Combat.prototype.createEmbeddedDocuments!=undefined)?(Combat.prototype.createEmbeddedDocuments):(Combat.prototype.createEmbeddedEntity)};


tokensVisible.SightLayer._turboComputeSight = function (origin, radius, {type, angle=360, density=6, rotation=0, unrestricted=false}={}){
	if (type==undefined || (type!=undefined && type=="sight")) {
		
	  let key =  radius*34.34 +origin.x+(origin.y*7.654)+ canvas.dimensions.width*1.1 + canvas.dimensions.height*3.3 + density*11+ (unrestricted?33:-1) +angle*1.1 + rotation  +(canvas.walls.endpoints.length * 12.2);  
      let sightResult = tokensVisible.SightCache.get(key);
      if(sightResult!=undefined) {
		 	return sightResult;
  	  }
  
	
      sightResult = tokensVisible.SightLayer._defaultcomputeSight.call(this, origin, radius, {type, angle, density, rotation, unrestricted} );
//      sightResult = wrapped.call(this, origin, radius, {type, angle, density, rotation, unrestricted} );

	  if(tokensVisible.SightCache.size>1000) tokensVisible.SightCache.delete(tokensVisible.SightCache.keys().next().value);
      tokensVisible.SightCache.set(key, sightResult);
	
    return sightResult; 
    }
	else
	{
	  return 	tokensVisible.SightLayer._defaultcomputeSight.call(this, origin, radius, {type, angle, density, rotation, unrestricted} );	
	//  wrapped.call(this, origin, radius, {type, angle, density, rotation, unrestricted} );	
	}	

};

tokensVisible.enableTurboSight = function() {
	tokensVisible.SightCache=new Map();
	
    if(WallsLayer.prototype.computePolygon !=undefined) {
 	   libWrapper.unregister(moduleName, 'WallsLayer.prototype.computePolygon', false);	 
 	   libWrapper.register(moduleName,'WallsLayer.prototype.computePolygon', tokensVisible.SightLayer._turboComputeSight, 'OVERRIDE'); 
    } 
    else {
	 // legacy 0.7.x support
		libWrapper.unregister(moduleName, 'SightLayer.computeSight', false);	
	    libWrapper.register(moduleName,'SightLayer.computeSight', tokensVisible.SightLayer._turboComputeSight, 'OVERRIDE'); 
    }
	

};

tokensVisible.disableTurboSight = function() {
	delete tokensVisible.SightCache;
	
	
    if(WallsLayer.prototype.computePolygon !=undefined) {
 	   libWrapper.unregister(moduleName, 'WallsLayer.prototype.computePolygon', false);	 
 	   libWrapper.register(moduleName,'WallsLayer.prototype.computePolygon',tokensVisible.SightLayer._defaultcomputeSight, 'OVERRIDE'); 
    } 
    else {
	 // legacy 0.7.x support
	
		libWrapper.unregister(moduleName, 'SightLayer.computeSight', false);	
		libWrapper.register(moduleName,'SightLayer.computeSight', tokensVisible.SightLayer._defaultcomputeSight, 'OVERRIDE'); 
    }
	
	
};


tokensVisible.SightLayer._DI_castRays=function(x, y, distance, {density=4, endpoints, limitAngle=false, aMin, aMax}={}, cast, standardArray, rayAccuracy, rays,sorter) {
   
    const rOffset = 0.02;

    // Enforce that all rays increase in angle from minimum towards maximum
    const rMin = limitAngle ? Ray.fromAngle(x, y, aMin, distance) : null;
    const rMax = limitAngle ? Ray.fromAngle(x, y, aMax, distance) : null;
   

    if(endpoints.length || standardArray.length) {
      const originaldensity = density;
		
	  if(rayAccuracy<1.5)	density = density* (2/3) * rayAccuracy;  // density can never be worse than standard
	  if(density<Math.min(2,originaldensity))density=Math.min(2,originaldensity);  // dont want to make the quality too good/expensive. Use Supermode for that.
		
      // First prioritize rays which are cast directly at wall endpoints
      for ( let e of endpoints ) {
        const ray = Ray.fromAngle(x, y, Math.atan2(e[1]-y, e[0]-x), distance);
        if ( limitAngle ) {
          ray.angle = this._adjustRayAngle(aMin, ray.angle);  // Standardize the angle
          if (!Number.between(ray.angle, aMin, aMax)) continue;
        }
        cast(ray);
      }

      if (rayAccuracy<1.5) {
        let varx = 0;
        for(varx=0;varx<standardArray.length;varx++){
          let currentAngle = standardArray[varx];
          if(!limitAngle || (currentAngle>=rMin && currentAngle<=rMax)){
            cast(Ray.fromAngle(x,y,currentAngle,distance),500);
          }
        }
      }

      const nr = rays.length;
      for ( let i=0; i<nr; i++ ) {
        const r = rays[i];
 
        cast(r.shiftAngle(rOffset),1000);
        cast(r.shiftAngle(-rOffset ),1000);
      }

      // Add additional limiting and central rays
      if ( limitAngle ) {
        const aCenter = aMin + ((aMax - aMin) / 2) + Math.PI;
        const rCenter = Ray.fromAngle(x, y, aCenter, 0);
        rCenter._isCenter = true;
        cast(rMin);
        cast(rCenter);
        cast(rMax);
      }
 
    }

    function extraRays(density,tol=50){
      // Add additional approximate rays to reach a desired radial density
      if ( !!density ) {

	    const rDensity = Math.toRadians(density);
        const nFill = Math.ceil((aMax - aMin) / rDensity);
 
        for ( let a of Array.fromRange(nFill) ) {
          cast(Ray.fromAngle(x, y, aMin + (a * rDensity), distance), tol);
        }
      }
    };


    extraRays(density);

    // Sort rays counter-clockwise (increasing radians)
    // sorter is defined here via dependancy injection. 
	sorter(rays);
    return rays;
};
  
tokensVisible._setEnhancedCastRays = function() {
         
     const standardArray = [-3.141592, -1.5707964,0,1.5707964];

     // Track rays and unique emission angles
	
     const sorter = (rays)=>{rays.sort((r1, r2) => r1.angle - r2.angle);};
     if (tokensVisible.SightCache!=undefined) tokensVisible.SightCache=new Map();
     let enhancedCastRays =function(x, y, distance, {density=4, endpoints, limitAngle=false, aMin, aMax}={}) {
		 
	     let rays = [];
		 const rayAccuracy = canvas.sight.tokenVision?(canvas.scene._viewPosition.scale):5;
	     const angles = new Set();
		 const cast = (ray, tol=50) => {
            tol = tol *50 /(rayAccuracy * 10);
            let a = Math.round(ray.angle *tol  );// / tol;
            if ( angles.has(a) ) return;
            rays.push(ray);
            angles.add(a);
         };

	     rays =tokensVisible.SightLayer._DI_castRays.call(this, x,y,distance,{density,endpoints,limitAngle,aMin,aMax},cast,standardArray, rayAccuracy, rays, sorter );
	     return rays;
	 };
	 if(WallsLayer.castRays!=undefined) {
  	   libWrapper.unregister(moduleName, 'WallsLayer.castRays', false);	 
  	   libWrapper.register(moduleName,'WallsLayer.castRays', enhancedCastRays, 'OVERRIDE'); 
	 } 
	 else {
		 // legacy 0.7.x support
	   libWrapper.unregister(moduleName, 'SightLayer._castRays', false);	 
	   libWrapper.register(moduleName,'SightLayer._castRays', enhancedCastRays, 'OVERRIDE'); 
     }
	   
	   
};
  
tokensVisible._setExtraEnhancedCastRays = function() {
	  
       const stubsorter = (rays)=>{ /* nothing to do because the rays are cast in sorted order in this mode */ };
       const realsorter = (rays)=>{rays.sort((r1, r2) => r1.angle - r2.angle);};
	   if (tokensVisible.SightCache!=undefined) tokensVisible.SightCache=new Map();
	  					    
	   let superCastRays=function(x, y, distance, {density, endpoints, limitAngle=false, aMin, aMax}={}){
			
		   if (!canvas.sight.tokenVision) return tokensVisible.SightLayer._defaultcastRays.call(this,x,y,distance,{density:density+3,endpoints,limitAngle,aMin,aMax});
 	
           let rays = [];

		   let sorter;
		   const cast = (ray )=> rays.push(ray);
		   const rayAccuracy = canvas.scene._viewPosition.scale;
       
	       if (!limitAngle){
               // endpoints and sorting are not needed for unlimited angle light or vision since we are casting rays in all directions anyway.
		 	   endpoints=[]; 
			   sorter=stubsorter;
		   }
		   else {
              // endpoints and real sorting needed for limited angle to render correctly
		   	   sorter=realsorter;
		   }
		   density = rayAccuracy;
		   
		   rays = tokensVisible.SightLayer._DI_castRays.call(this,x,y,distance,{"density":Math.min(2.0,density),endpoints,limitAngle,aMin,aMax},cast,[],rayAccuracy,rays, sorter);
	  	   return rays;
	   };
	   
  	 if(WallsLayer.castRays!=undefined) {
 	 	libWrapper.unregister(moduleName, 'WallsLayer.castRays', false);  
 	 	libWrapper.register(moduleName,'WallsLayer.castRays', superCastRays, 'OVERRIDE'); 
  	 } 
  	 else {
		 // legacy 0.7.x support
	 	libWrapper.unregister(moduleName, 'SightLayer._castRays', false);  
	 	libWrapper.register(moduleName,'SightLayer._castRays', superCastRays, 'OVERRIDE'); 
       }
	   
	   

	    
};
  
tokensVisible._setStandardCastRays = function() {
	   if (tokensVisible.SightCache!=undefined) tokensVisible.SightCache=new Map();
	   
	   
    	 if(WallsLayer.castRays!=undefined) {
   	 		   libWrapper.unregister(moduleName, 'WallsLayer.castRays', false);
			   libWrapper.register(moduleName,'WallsLayer.castRays', tokensVisible.SightLayer._defaultcastRays , 'OVERRIDE'); 
			   
    	 } 
    	 else {
			 // legacy 0.7.x support
	     	   libWrapper.unregister(moduleName, 'SightLayer._castRays', false);
			   libWrapper.register(moduleName,'SightLayer._castRays', tokensVisible.SightLayer._defaultcastRays , 'OVERRIDE'); 
         }
	
	   	   
};


  
  
tokensVisible.setupCombatantMasking = function (settingValue) {

  
  if (settingValue=="default") {
     if(Combat.prototype.createEmbeddedDocuments!=undefined) {
       libWrapper.unregister(moduleName,'Combat.prototype.createEmbeddedDocuments', false); 
	   libWrapper.register(moduleName,'Combat.prototype.createEmbeddedDocuments', tokensVisible.Combat._defaultcreateEmbeddedEntity, 'OVERRIDE'); 
     } else {	 
		 // legacy 0.7.x support
       libWrapper.unregister(moduleName,'Combat.prototype.createEmbeddedEntity', false); 
	   libWrapper.register(moduleName,'Combat.prototype.createEmbeddedEntity', tokensVisible.Combat._defaultcreateEmbeddedEntity, 'OVERRIDE'); 
	   
     }

	 return;
  }
	  
  let combatMaskedEntities = async function (wrapped,embeddedName, data, options) {
	  

	 if (embeddedName == 'Combatant') {
	
       // combatants created via the token HUD are always in an array - otherwise NOT. We only want to 
	   // look at the token disposition when the combatant is created directly from the Token therefore
	   // do nothing if the data isn't an array. 
	   if (Array.isArray(data)) 
          data.forEach((i)=>{ 
            let TOKEN=canvas.scene.data.tokens.find((k)=>k._id==i.tokenId);
		  
             // break statements deliberately missing 
			const disposition=(TOKEN.disposition!=undefined)?(TOKEN.disposition):(TOKEN.data.disposition);
			
			 switch(disposition){
               case -1: if (settingValue=="hostile") i.hidden=true;
               case 0: if (settingValue=="neutral") i.hidden=true;
               case 1: if (settingValue=="all") i.hidden=true;
             }
     	    

	     });
     }

	 return wrapped(embeddedName,data,options);

  };
  if(Combat.prototype.createEmbeddedDocuments!=undefined) {
     libWrapper.unregister(moduleName,'Combat.prototype.createEmbeddedDocuments', false); 
     libWrapper.register(moduleName,'Combat.prototype.createEmbeddedDocuments', combatMaskedEntities, 'WRAPPER'); 
  } else
  {  // legacy 0.7.x support
	 libWrapper.unregister(moduleName,'Combat.prototype.createEmbeddedEntity', false); 
     libWrapper.register(moduleName,'Combat.prototype.createEmbeddedEntity', combatMaskedEntities, 'WRAPPER'); 
  }
}

   



	  
