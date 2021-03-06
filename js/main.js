//Polyfill for Internet Explorer
Math.log10 = function (x) { return Math.log(x) / Math.LN10; };

(function() {
    /**
    * Decimal adjustment of a number.
    *
    * @param {String}  type  The type of adjustment.
    * @param {Number}  value The number.
    * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
    * @returns {Number} The adjusted value.
    */
    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (value === null || isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

        // Decimal round
        if (!Math.round10) {
            Math.round10 = function(value, exp) {
                return decimalAdjust('round', value, exp);
            };
        }
        // Decimal floor
        if (!Math.floor10) {
            Math.floor10 = function(value, exp) {
                return decimalAdjust('floor', value, exp);
            };
        }
        // Decimal ceil
        if (!Math.ceil10) {
            Math.ceil10 = function(value, exp) {
            return decimalAdjust('ceil', value, exp);
        };
    }
})();

/*
var settingsAdvancedVisible = false;
function showAdvancedClick() {
    $("#advancedSettings").toggle(100, function(){
        $("#showAdvanced").html( (settingsAdvancedVisible = !settingsAdvancedVisible) ? "Hide Advanced Settings" : "Show Advanced Settings");
    });
}
*/

var settingsCustomVisible = false;
function showCustomClick() {
    $("#customSettings").toggle(100, function(){
        $("#showCustom").html( (settingsCustomVisible = !settingsCustomVisible) ? "Hide Custom Settings" : "Custom Build Settings");
    });
}

var settingsOutsiderVisible = false;
function showOutsiderClick() {
    $("#outsiderLevels").toggle(100, function(){
        $("#showOutsider").html( (settingsOutsiderVisible = !settingsOutsiderVisible) ? "Hide Outsider Levels" : "Set Outsider Levels");
    });
}

var settingsAncientsVisible = false;
function showAncientsClick() {
    $("#ancientsBuild").toggle(100, function(){
        $("#showAncients").html( (settingsAncientsVisible = !settingsAncientsVisible) ? "Hide Ancient Build" : "Show Ancient Build");
    });
}

var settingsDriejVisible = false;
function showDriejClick() {
    $("#driejSettings").toggle(100, function(){
        $("#showDriej").html( (settingsDriejVisible = !settingsDriejVisible) ? "Hide Driej's Stats" : "Show Driej's Stats");
    });
}
/*
function setDefaults() {
    $("#zoneOverride").val(0);
}

function defaultClick() {
    setDefaults();
}
*/
function getCostFromLevel(level) {
    return (level+1)*(level/2);
}

function spendAS( ratio, as ) {
    var spendable = ratio*as;
    if( spendable<1 ) return 0;
    return Math.floor( Math.pow( 8*spendable + 1, 0.5 )/2 - 0.5 );
}

function nOS( ancientSouls, transcendentPower, zone ) {
    if(ancientSouls > 20000) {
        ancientSouls -= 11325;
        let pony = spendAS(0.88, ancientSouls);
        ancientSouls -= getCostFromLevel(pony);
        return [150, ancientSouls, pony];
    }
    let hpMultiplier = Math.min(1.545, 1.145 + zone / 500000);
    let hsMultiplier = Math.pow(1 + transcendentPower, 0.2);
    let heroDamageMultiplier = (zone > 1.23e6) ? 1000 : ((zone > 168000) ? 4.5 : 4);
    let heroCostMultiplier = (zone > 1.23e6) ? 1.22 : 1.07;
    let goldToDps = Math.log10(heroDamageMultiplier) / Math.log10(heroCostMultiplier) / 25;
    let dpsToZones = Math.log10(hpMultiplier) - Math.log10(1.15) * goldToDps;
    let chor = 0;
    let phan = 0;
    let pony = 0;

    let chorBuff = 1 / 0.95;

    while (ancientSouls > 0) {
        if (pony < 1) {
            ancientSouls -= ++pony;
            continue;
        } else if (phan < 3) {
            phan++;
            ancientSouls--;
            continue;
        }

        let damageIncrease = (phan + 2) / (phan + 1);
        let zoneIncrease = Math.log10(damageIncrease) / dpsToZones;
        let phanBuff = Math.pow(hsMultiplier, zoneIncrease);

        if (phan < 5) {
            phanBuff *= 1.3;
        }

        if (chor < ancientSouls && chor < 150) {
            let chorBpAS = Math.pow(chorBuff, 1 / (chor + 1));
            if (chorBpAS >= phanBuff) {
                if (pony < ancientSouls) {
                    let ponyBuff = (Math.pow(pony + 1, 2) * 10 + 1) / (Math.pow(pony, 2) * 10 + 1);
                    let ponyBpAS = Math.pow(ponyBuff, 1 / (pony + 1));
                    if (ponyBpAS >= chorBpAS) {
                        ancientSouls -= ++pony;
                        continue;
                    }
                }
                ancientSouls -= ++chor;
                continue;
            }
        }

        if (pony < ancientSouls) {
            let ponyBuff = (Math.pow(pony + 1, 2) * 10 + 1) / (Math.pow(pony, 2) * 10 + 1);
            let ponyBpAS = Math.pow(ponyBuff, 1 / (pony + 1));
            if (ponyBpAS >= phanBuff) {
                ancientSouls -= ++pony;
                continue;
            }
        }

        phan++;
        ancientSouls--;

    }

    return [chor, phan, pony];
}//function nOS

function findNumTranscensions(ancientSouls, nonBorb, zonePush, targetZone) {
    let transcensions = 0;
    let currentZone = 0;
    let borb;
    while(currentZone < targetZone) {
        borb = spendAS(1, ancientSouls - nonBorb);
        currentZone = borb * 5000 + 500;
        currentZone = Math.floor(currentZone * (1 + zonePush / 100));
        ancientSouls = Math.log10(1.25) * currentZone;
        transcensions++;
    }
    return transcensions;
}

function findStrategy(ancientSouls) {
    if(ancientSouls < 340000) {
        let targetZone = 4.5e6;
        let nonBorb = 4500;
        let zonePush = 1;
        let numTranscensions = findNumTranscensions(ancientSouls, nonBorb, zonePush, targetZone);
        let newNumTranscensions = numTranscensions;
        while(zonePush > 0) {
            zonePush -= 0.1;
            newNumTranscensions = findNumTranscensions(ancientSouls, nonBorb, zonePush, targetZone);
            if (newNumTranscensions > numTranscensions) {
                return [nonBorb, zonePush + 0.1];
            }
        }
        while(newNumTranscensions === numTranscensions) {
            nonBorb += 500;
            newNumTranscensions = findNumTranscensions(ancientSouls, nonBorb, zonePush, targetZone);
        }
        return [nonBorb - 500, 0];
    } else {
        return [2000, 2.5];
    }
}

function getInputs() {
    var ancientSouls = parseFloat( $("#inputAncientSouls").val() || 0 );
    if( !(ancientSouls>=0) ) {
        alert("Calculation failed. Ancient Souls must be a non-negative number.");
        return -1;
    }
    var val = $( "#inputZoneOverride" ).val();
        zoneOverride = ( val=="" ) ? 0 : parseFloat( val );
    if( isNaN(zoneOverride) || zoneOverride<0 ) {
        /*setDefaults();*/
        zoneOverride = 0;
        alert("Please input a positive number. The zone override value has been reset.");
    }
    zoneOverride = Math.floor(zoneOverride);
    return [Math.floor(ancientSouls), zoneOverride];
}    

function refresh(test=false, ancientSouls=0, useBeta=false) {
    //Inputs
    this.useBeta = test ? useBeta : $("#beta").is(":checked");
    if (!test) {
        var [ancientSouls, zoneOverride] = getInputs();
        if( ancientSouls==-1 ) return;
        this.reserve = $("#reserveAS").is(":checked");
    }

    var transcendentPower = (25 - 23 * Math.exp(-0.0003 * ancientSouls)) / 100;

    // Figure out goals for this transcendence
    this.newHze = Math.floor(zoneOverride||0);
    let nonBorb;
    let zonePush = 0;
    if(this.newHze==0){
    if (ancientSouls < 100) {
        let a = ancientSouls + 42;
        this.newHze = (a / 5 - 6) * 51.8 * Math.log(1.25) / Math.log(1 + transcendentPower);
    } else if (ancientSouls < 10500) {
        this.newHze = (1 - Math.exp(-ancientSouls / 3900)) * 200000 + 4800;
    } else if (ancientSouls < 20000) {
        // 20k or +8000 Ancient Souls
        this.newHze = Math.max(215000, ancientSouls*10.32 + 90000);
    } else if (ancientSouls < 27000 ) {
        // 43.3k Ancient Souls
        this.newHze =  458000;
    } else {
        // End Game
        [nonBorb, zonePush] = findStrategy(ancientSouls);
        let b = this.spendAS(1, ancientSouls - nonBorb);
        this.newHze = Math.min(5.5e6, b * 5000 + (this.useBeta?500:46500));
    }}

    // Push beyond 2mpz
    this.borbTarget = false;
    let versionZoneDiff;
    if (ancientSouls >= 27000) {
        versionZoneDiff = (this.useBeta?0:46000);
        this.borbTarget = this.newHze - versionZoneDiff;
        this.newHze = this.useBeta
            ? Math.min(5.5e6, (1 + zonePush / 100) * this.newHze)
            : Math.min(5.5e6, this.newHze);
    }

    this.newHze = Math.floor(this.newHze);
    let newLogHeroSouls = Math.log10(1 + transcendentPower) * this.newHze / 5 + 6;

    // Ancient effects
    let ancientLevels = Math.floor(newLogHeroSouls / Math.log10(2) - Math.log(25)/Math.log(2)) + -1;
    let kuma = this.useBeta
        ? -8 * (1 - Math.exp(-0.025 * ancientLevels))
        : -100 * (1 - Math.exp(-0.0025 * ancientLevels));
    let atman = 75 * (1 - Math.exp(-0.013 * ancientLevels));
    let bubos = -5 * (1 - Math.exp(-0.002 * ancientLevels));
    let chronos = 30 * (1 - Math.exp(-0.034 * ancientLevels));
    let dora = 9900 * (1 - Math.exp(-0.002 * ancientLevels));

    // Unbuffed Stats
    let nerfs = Math.floor(this.newHze / 500);
    let unbuffedMonstersPerZone = Math.round10(10 + nerfs * (this.useBeta ? 0.1 : 1), -2);
    let unbuffedTreasureChestChance = Math.exp(-0.006 * nerfs);
    let unbuffedBossHealth = 10 + nerfs * 0.4;
    let unbuffedBossTimer = 30 - nerfs * 2;
    let unbuffedPrimalBossChance = 25 - nerfs * 2;

    // Outsider Caps
    let borbCap = this.borbTarget
        ? Math.ceil((this.borbTarget - 500) / 5000)
        : ancientSouls >= 10500
            ? Math.ceil((this.newHze - 500) / 5000)
            : Math.max(0, Math.ceil(((unbuffedMonstersPerZone - 2.1) / - kuma - 1) / (this.useBeta ? 0.125 : 0.1)));
    let rhageistCap = Math.ceil(((100 - unbuffedPrimalBossChance) / atman - 1) / 0.25);
    let kariquaCap = Math.ceil(((unbuffedBossHealth - 5) / -bubos - 1) / 0.5);
    let orphalasCap = Math.max(1, Math.ceil(((2 - unbuffedBossTimer) / chronos - 1) / 0.75)) + 2;
    let senakhanCap = Math.max(1, Math.ceil((100 / unbuffedTreasureChestChance) / (dora / 100 + 1) - 1));

    // Outsider Ratios
    let rhageistRatio;
    let kariquaRatio;
    let orphalasRatio;
    let senakhanRatio;

    if (ancientSouls < 100) {
        let ratioChange = ancientSouls / 100;
        rhageistRatio = 0.2*ratioChange;
        kariquaRatio = 0.01*ratioChange;
        orphalasRatio = 0.05*ratioChange;
        senakhanRatio = 0.05*ratioChange;
    } else if (ancientSouls < 27000) {
        rhageistRatio = 0.2;
        kariquaRatio = 0.01;
        orphalasRatio = 0.05;
        senakhanRatio = 0.05;
    } else {
        rhageistRatio = 0;
        kariquaRatio = 0;
        orphalasRatio = 0;
        senakhanRatio = 0;
    }

    // Outsider Leveling
    this.remainingAncientSouls = ancientSouls;

    let borbLevel;
    if (this.useBeta || ancientSouls >= 10500) {
        let borb15 = Math.min(15, this.spendAS(0.5, this.remainingAncientSouls));
        let borb10pc = this.spendAS(0.1, this.remainingAncientSouls);
        let borbLate = this.remainingAncientSouls >= 10000 ? borbCap : 0;
        borbLevel = Math.max(borb15, borb10pc, borbLate);
    } else {
        borbLevel = Math.max((this.remainingAncientSouls >= 300) ? 15 : this.spendAS(0.4, this.remainingAncientSouls), borbCap);
    }

    if (this.getCostFromLevel(borbLevel) > (this.remainingAncientSouls - 5)) {
        borbLevel = this.spendAS(1, this.remainingAncientSouls - 5);
    }

    this.remainingAncientSouls -= this.getCostFromLevel(borbLevel);

    // Xyl sucks
    let xyliqilLevel = 0;
    this.remainingAncientSouls -= this.getCostFromLevel(xyliqilLevel);

    // Super outsiders
    let rhageistLevel = this.getCostFromLevel(rhageistCap) > (this.remainingAncientSouls * rhageistRatio)
        ? this.spendAS(rhageistRatio, this.remainingAncientSouls)
        : rhageistCap;
    let kariquaLevel = this.getCostFromLevel(kariquaCap) > (this.remainingAncientSouls * kariquaRatio)
        ? this.spendAS(kariquaRatio, this.remainingAncientSouls)
        : kariquaCap;
    let orphalasLevel = this.getCostFromLevel(orphalasCap) > (this.remainingAncientSouls * orphalasRatio)
        ? this.spendAS(orphalasRatio, this.remainingAncientSouls)
        : orphalasCap;
    let senakhanLevel = this.getCostFromLevel(senakhanCap) > (this.remainingAncientSouls * senakhanRatio)
        ? this.spendAS(senakhanRatio, this.remainingAncientSouls)
        : senakhanCap;

    this.remainingAncientSouls -= this.getCostFromLevel(rhageistLevel);
    this.remainingAncientSouls -= this.getCostFromLevel(kariquaLevel);
    this.remainingAncientSouls -= this.getCostFromLevel(orphalasLevel);
    this.remainingAncientSouls -= this.getCostFromLevel(senakhanLevel);

    // Chor, Phan, and Pony
    let [chorLevel, phanLevel, ponyLevel] = this.nOS(this.remainingAncientSouls, transcendentPower, this.newHze);

    this.remainingAncientSouls -= this.getCostFromLevel(chorLevel);
    this.remainingAncientSouls -= phanLevel;
    this.remainingAncientSouls -= this.getCostFromLevel(ponyLevel);

    // End of transcension estimates
    let ponyBonus = Math.pow(ponyLevel, 2) * 10;
    let series = 1 / (1 - 1 / (1 + transcendentPower));
    let buffedPrimalBossChance = Math.max(5, unbuffedPrimalBossChance + atman * (1 + rhageistLevel * 0.25));
    let pbcm = Math.min(buffedPrimalBossChance, 100) / 100;

    newLogHeroSouls = Math.log10(1 + transcendentPower) * (this.newHze - 105) / 5 + Math.log10(ponyBonus + 1) + Math.log10(20 * series * pbcm);
    this.newAncientSouls = Math.max(ancientSouls, Math.floor(newLogHeroSouls * 5));
    this.ancientSoulsDiff = this.newAncientSouls - ancientSouls;
    this.newTranscendentPower = (25 - 23 * Math.exp(-0.0003 * this.newAncientSouls)) / 100;

    // Display the results
    $("#TP").html("TP: " + (transcendentPower*100).toFixed(4) + "%" );
    //End of Transcension
    $("#predictedHZE").html("Highest Zone: " + this.newHze.toLocaleString() );
    $("#predictedHS").html("logHS: " + newLogHeroSouls.toFixed(2).toLocaleString() );
    $("#predictedAS").html("AncientSouls: " + this.newAncientSouls.toLocaleString() + " (+" + this.ancientSoulsDiff.toLocaleString() + ")");
    $("#predictedTP").html("TP: " + (this.newTranscendentPower*100).toFixed(4) + "%" );
    $("#predictedAncients").html("Ancient Levels: " + ancientLevels.toLocaleString() );
    $("#kuma").html( kuma.toFixed(2) + " monsters per zone" );
    $("#atman").html( atman.toFixed(2) + "% chance of primal" );
    $("#bubos").html( bubos.toFixed(2) + " boss life" );
    $("#chronos").html( chronos.toFixed(2) + "s boss fight timer" );
    $("#dora").html( dora.toFixed(2) + "% treasure chests" );
    //Unbuffed Stats
    $("#unbuffedMPZ").html( "Monsters per Zone: " + unbuffedMonstersPerZone.toFixed(2) );
    $("#unbuffedTCC").html( "Treasure Chests: " + unbuffedTreasureChestChance.toFixed(6) + "x" );
    $("#unbuffedBossHP").html( "Boss Health: " + unbuffedBossHealth.toFixed(1) + "x" );
    $("#unbuffedTimer").html( "Boss Timer: " + unbuffedBossTimer + "s" );
    $("#unbuffedPBC").html( "Primal Chance: " + unbuffedPrimalBossChance + "%" );
    //Buffed Stats
    var buffedMPZ = unbuffedMonstersPerZone + kuma*( 1 + borbLevel/(this.useBeta?8:10) );
        buffedTCC = Math.max( 1, ( dora*( 1 + senakhanLevel)/100 + 1 )*unbuffedTreasureChestChance );
        buffedBossHP = Math.floor( Math.max( 5, unbuffedBossHealth + bubos*( 1 + kariquaLevel*0.5 ) ) );
        buffedTimer = Math.max( 2, unbuffedBossTimer + chronos*( 1 + orphalasLevel*0.75 ) );
        buffedPBC = Math.max( 5, unbuffedPrimalBossChance + atman*( 1 + rhageistLevel*0.25 ) );
    $("#buffedMPZ").html( "Monsters per Zone: " + buffedMPZ.toFixed(2) + (buffedMPZ<2?" (2)":"") );
    $("#buffedTCC").html( "Treasure Chests: " + buffedTCC.toFixed() + "%" );
    $("#buffedBossHP").html( "Boss Health: " + buffedBossHP.toFixed() + "x" );
    $("#buffedTimer").html( "Boss Timer: " + buffedTimer.toFixed() + "s" );
    $("#buffedPBC").html( "Primal Chance: " + buffedPBC.toFixed() + "%" );
    //Zone Breakpoints
    if( this.useBeta ) {
        $("#HighMpz").html( "2.1 monsters per zone: " + ( -39500 - Math.floor( kuma*( 1 + borbLevel/8 )*10 )*500 ).toLocaleString() );
    }else {
        $("#HighMpz").html( "3 monsters per zone: " + ( -3500 - Math.floor( kuma*( 1 + borbLevel/10 ) )*500 ).toLocaleString() );
    }
    $("#5PBC").html( "5% primal chance: " + ( 5500 + Math.floor( atman*( 1 + rhageistLevel/4 )/2)*500 ).toLocaleString() );
    $("#90BHP").html( "90% boss health: " + ( Math.ceil( ( bubos*( 1 + kariquaLevel/2 )*-10 - 10 )/0.4 )*500 ).toLocaleString() );
    $("#2sTimer").html( "2s boss timer: " + ( 7000 + Math.floor( chronos*( 1 + orphalasLevel*0.75 )/2 )*500 ).toLocaleString() );
    $("#99TTC").html( "99% treasure chests: " + (Math.ceil( Math.log( 0.995/( dora/10000*( 1 + senakhanLevel ) + 0.01 ) )/-0.006 )*500 ).toLocaleString() );
    $("#1TTC").html( "1% treasure chests: " + (Math.ceil( Math.log( 0.015/( dora/10000*( 1 + senakhanLevel ) + 0.01 ) )/-0.006 )*500 ).toLocaleString() );
    //Driej's Outsiders Table
    $("#OutsidersTable tbody").html(
        "<tr><td>Xyliqil</td><td>"+xyliqilLevel.toLocaleString()+"</td><td>"+getCostFromLevel(xyliqilLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Chor'gorloth</td><td>"+chorLevel.toLocaleString()+"</td><td>"+getCostFromLevel(chorLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Phandoryss</td><td>"+phanLevel.toLocaleString()+"</td><td>"+phanLevel.toLocaleString()+"</td><td>"+
        "<tr><td>Ponyboy</td><td>"+ponyLevel.toLocaleString()+"</td><td>"+getCostFromLevel(ponyLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Borb</td><td>"+borbLevel.toLocaleString()+"</td><td>"+getCostFromLevel(borbLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Rhageist</td><td>"+rhageistLevel.toLocaleString()+"</td><td>"+getCostFromLevel(rhageistLevel).toLocaleString()+"</td><td>"+
        "<tr><td>K'Ariqua</td><td>"+kariquaLevel.toLocaleString()+"</td><td>"+getCostFromLevel(kariquaLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Orphalas</td><td>"+orphalasLevel.toLocaleString()+"</td><td>"+getCostFromLevel(orphalasLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Sen-Akhan</td><td>"+senakhanLevel.toLocaleString()+"</td><td>"+getCostFromLevel(senakhanLevel).toLocaleString()+"</td><td>"
    );
    //lithe333 stuffs begins here
    var [litheAncientSouls, litheZone, litheZoneOverride, litheBuild, litheCustom, litheIdleDPS, litheHybridDPS, litheActiveDPS, litheIdleGold, litheHybridGold, litheActiveGold, litheHeroSoul, litheSkills, litheProgression, litheRubies, litheXyliqilLevel, litheChorLevel, lithePhanLevel, lithePonyLevel, litheBorbLevel, litheRhageistLevel, litheKariquaLevel, litheOrphalasLevel, litheSenakhanLevel] = getLitheInputs();
 //var [litheAncientSouls, litheZone, litheZoneOverride,
//litheBuild, litheCustom, litheIdleDPS, litheHybridDPS, 
//litheActiveDPS, litheIdleGold, litheHybridGold, 
//litheActiveGold, litheHeroSoul, litheSkills, litheProgression, 
//litheRubies
    
    //lithe333 Outsiders Table
    $("#outsidersTable tbody").html(
        "<tr><td>Idle</td><td>Xyliqil</td><td>"+litheXyliqilLevel.toLocaleString()+"</td><td>"+getCostFromLevel(litheXyliqilLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Ancient cost</td><td>Chor'gorloth</td><td>"+litheChorLevel.toLocaleString()+"</td><td>"+getCostFromLevel(litheChorLevel).toLocaleString()+"</td><td>"+
        "<tr><td>DPS</td><td>Phandoryss</td><td>"+lithePhanLevel.toLocaleString()+"</td><td>"+lithePhanLevel.toLocaleString()+"</td><td>"+
        "<tr><td>Primal Hero Souls</td><td>Ponyboy</td><td>"+lithePonyLevel.toLocaleString()+"</td><td>"+getCostFromLevel(lithePonyLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Monster Reduction</td><td>Borb</td><td>"+litheBorbLevel.toLocaleString()+"</td><td>"+getCostFromLevel(litheBorbLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Primal Bosses</td><td>Rhageist</td><td>"+litheRhageistLevel.toLocaleString()+"</td><td>"+getCostFromLevel(litheRhageistLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Boss Health</td><td>K'Ariqua</td><td>"+litheKariquaLevel.toLocaleString()+"</td><td>"+getCostFromLevel(litheKariquaLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Boss Time</td><td>Orphalas</td><td>"+litheOrphalasLevel.toLocaleString()+"</td><td>"+getCostFromLevel(litheOrphalasLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Treasure Chest</td><td>Sen-Akhan</td><td>"+litheSenakhanLevel.toLocaleString()+"</td><td>"+getCostFromLevel(litheSenakhanLevel).toLocaleString()+"</td><td>"
    );
    //lithe333 Ancients Table
    $("#ancientsTable tbody").html(
        "<tr><td>Idle DPS</td><td>Siyalatas</td><td>"+xyliqilLevel.toLocaleString()+"</td><td>"+getCostFromLevel(xyliqilLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Hybrid DPS</td><td>Argaiv</td><td>"+chorLevel.toLocaleString()+"</td><td>"+getCostFromLevel(chorLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Hybrid DPS</td><td>Morgulis</td><td>"+chorLevel.toLocaleString()+"</td><td>"+getCostFromLevel(chorLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Active DPS</td><td>Bhaal, Fragsworth</td><td>"+phanLevel.toLocaleString()+"</td><td>"+phanLevel.toLocaleString()+"</td><td>"+
        "<tr><td>Active DPS</td><td>Juggernaut</td><td>"+phanLevel.toLocaleString()+"</td><td>"+phanLevel.toLocaleString()+"</td><td>"+
        "<tr><td>Idle Gold</td><td>Libertas</td><td>"+ponyLevel.toLocaleString()+"</td><td>"+getCostFromLevel(ponyLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Idle Gold</td><td>Nogardnit</td><td>"+ponyLevel.toLocaleString()+"</td><td>"+getCostFromLevel(ponyLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Hybrid Gold</td><td>Dogcog, Dora, Fortuna</td><td>"+borbLevel.toLocaleString()+"</td><td>"+getCostFromLevel(borbLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Hybrid Gold</td><td>Mammon, Mimzee</td><td>"+borbLevel.toLocaleString()+"</td><td>"+getCostFromLevel(borbLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Active Gold</td><td>Pluto</td><td>"+rhageistLevel.toLocaleString()+"</td><td>"+getCostFromLevel(rhageistLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Hero Souls</td><td>Atman</td><td>"+rhageistLevel.toLocaleString()+"</td><td>"+getCostFromLevel(rhageistLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Skills</td><td>Berserker, Chawedo, Energon, Hecatoncheir, Kleptos, Sniperino</td><td>"+kariquaLevel.toLocaleString()+"</td><td>"+getCostFromLevel(kariquaLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Skills</td><td>Vaagur</td><td>"+kariquaLevel.toLocaleString()+"</td><td>"+getCostFromLevel(kariquaLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Progression</td><td>Bubos, Kumawakamaru, Chronos</td><td>"+orphalasLevel.toLocaleString()+"</td><td>"+getCostFromLevel(orphalasLevel).toLocaleString()+"</td><td>"+
        "<tr><td>Rubies</td><td>Revolc</td><td>"+senakhanLevel.toLocaleString()+"</td><td>"+getCostFromLevel(senakhanLevel).toLocaleString()+"</td><td>"
    );
    /*
    $("#share").html(
        xyliqilLevel+'/'+
        chorLevel+'/'+
        phanLevel+'/'+
        ponyLevel+'//'+
        borbLevel+'/'+
        rhageistLevel+'/'+
        kariquaLevel+'/'+
        orphalasLevel+'/'+
        senakhanLevel
    );
    $("#unspentAS").html( "Unspent: " + unspent );
    */
}

//lithe333 functions

function getLitheInputs() {
    // ancient souls, hero souls, autoclikers
    var ancientSouls = parseFloat( $("#inputAncientSouls").val() || 0 );
    if( !(ancientSouls>=0) ) {
        alert("Calculation failed. Ancient Souls must be a non-negative number.");
        return -1;
    }
    ancientSouls = Math.floor(ancientSouls);
    var heroSouls = parseFloat( $("#inputHeroSouls").val() || 0 );
    if( !(heroSouls>=0) ) {
        alert("Calculation failed. Hero Souls must be a non-negative number.");
        return -1;
    }
    heroSouls = Math.floor(heroSouls);
    var autoClikers = parseFloat( $("#inputAutoClikers").val() || 0 );
    if( !(autoClikers>=0) ) {
        alert("Calculation failed. Auto Clikers must be a non-negative number.");
        return -1;
    }
    autoClikers = Math.floor(autoClikers);
    // zone used for calculation
    var zone = "highest";
    if($("#inputStartingZone").is(":checked")) {
        zone = "starting";
    } else   if($("#inputCustomZone").is(":checked")) {
        zone = "custom";
    }
    var zoneOverride = parseFloat( $("#inputZoneOverride").val() || 0 );
    if( isNaN(zoneOverride) || zoneOverride<0 ) {
        /*setDefaults();*/
        $("#inputZoneOverride").val(0);
        zoneOverride = 0;
        alert("Please input a positive number. The zone override value has been reset.");
    }
    zoneOverride = Math.floor(zoneOverride);
    // build type used for calculation
    var build = "active";
    var custom = "0";
    if($("#inputIdleBuild").is(":checked")) {
        zone = "idle";
    } else   if($("#inputHybridBuild").is(":checked")) {
        zone = "hybrid";
    } else   if($("#inputCustomBuild").is(":checked")) {
        zone = "custom";
        custom = $( "#inputCustomBuild" ).val();
    }
    // custom build inputs
    var idleDPS = parseFloat( $("#inputIdleDPS").val() || 0 );
    if( !(idleDPS>=0) || (idleDPS>100) ) {
        alert("Calculation failed. Idle DPS must be between 0 and 100.");
        return -1;
    }
    idleDPS = Math.floor(idleDPS);
    var hybridDPS = parseFloat( $("#inputHybridDPS").val() || 0 );
    if( !(hybridDPS>=0) || (hybridDPS>100) ) {
        alert("Calculation failed. Hybrid DPS must be between 0 and 100.");
        return -1;
    }
    hybridDPS = Math.floor(hybridDPS);
    var activeDPS = parseFloat( $("#inputActiveDPS").val() || 0 );
    if( !(activeDPS>=0) || (activeDPS>100) ) {
        alert("Calculation failed. Active DPS must be between 0 and 100.");
        return -1;
    }
    activeDPS = Math.floor(activeDPS);
    var idleGold = parseFloat( $("#inputIdleGold").val() || 0 );
    if( !(idleGold>=0) || (idleGold>100) ) {
        alert("Calculation failed. Idle Gold must be between 0 and 100.");
        return -1;
    }
    idleGold = Math.floor(idleGold);
    var hybridGold = parseFloat( $("#inputHybridGold").val() || 0 );
    if( !(hybridGold>=0) || (hybridGold>100) ) {
        alert("Calculation failed. Hybrid Gold must be between 0 and 100.");
        return -1;
    }
    hybridGold = Math.floor(hybridGold);
    var activeGold = parseFloat( $("#inputActiveGold").val() || 0 );
    if( !(activeGold>=0) || (activeGold>100) ) {
        alert("Calculation failed. Active Gold must be between 0 and 100.");
        return -1;
    }
    activeGold = Math.floor(activeGold);
    var heroSoul = parseFloat( $("#inputHeroSoul").val() || 0 );
    if( !(heroSoul>=0) || (heroSoul>100) ) {
        alert("Calculation failed. Hero Souls must be between 0 and 100.");
        return -1;
    }
    heroSoul = Math.floor(heroSoul);
    var skills = parseFloat( $("#inputSkills").val() || 0 );
    if( !(skills>=0) || (skills>100) ) {
        alert("Calculation failed. Skills must be between 0 and 100.");
        return -1;
    }
    skills = Math.floor(skills);
    var progression = parseFloat( $("#inputProgression").val() || 0 );
    if( !(progression>=0) || (progression>100) ) {
        alert("Calculation failed. Progression must be between 0 and 100.");
        return -1;
    }
    progression = Math.floor(progression);
    var rubies = parseFloat( $("#inputRubies").val() || 0 );
    if( !(rubies>=0) || (rubies>100) ) {
        alert("Calculation failed. Rubies must be between 0 and 100.");
        return -1;
    }
    rubies = Math.floor(rubies);
    // setting outsider levels
    var xyliqilLevel = parseFloat( $("#inputXyliqilLevel").val() || 0 );
    if( !(xyliqilLevel>=0) ) {
        alert("Calculation failed. Xyliqil Level must be a non-negative number.");
        return -1;
    }
    xyliqilLevel = Math.floor(xyliqilLevel);
    var chorLevel = parseFloat( $("#inputChorLevel").val() || 0 );
    if( !(chorLevel>=0) ) {
        alert("Calculation failed. Chor'gorloth Level must be a non-negative number.");
        return -1;
    }
    chorLevel = Math.floor(chorLevel);
    var phanLevel = parseFloat( $("#inputPhanLevel").val() || 0 );
    if( !(phanLevel>=0) ) {
        alert("Calculation failed. Phandoryss Level must be a non-negative number.");
        return -1;
    }
    phanLevel = Math.floor(phanLevel);
    var ponyLevel = parseFloat( $("#inputPonyLevel").val() || 0 );
    if( !(ponyLevel>=0) ) {
        alert("Calculation failed. Ponyboy Level must be a non-negative number.");
        return -1;
    }
    ponyLevel = Math.floor(ponyLevel);
    var borbLevel = parseFloat( $("#inputBorbLevel").val() || 0 );
    if( !(borbLevel>=0) ) {
        alert("Calculation failed. Borb Level must be a non-negative number.");
        return -1;
    }
    borbLevel = Math.floor(borbLevel);
    var rhageistLevel = parseFloat( $("#inputRhageistLevel").val() || 0 );
    if( !(rhageistLevel>=0) ) {
        alert("Calculation failed. Rhageist Level must be a non-negative number.");
        return -1;
    }
    rhageistLevel = Math.floor(rhageistLevel);
    var kariquaLevel = parseFloat( $("#inputKariquaLevel").val() || 0 );
    if( !(kariquaLevel>=0) ) {
        alert("Calculation failed. K'Ariqua Level must be a non-negative number.");
        return -1;
    }
    kariquaLevel = Math.floor(kariquaLevel);
    var orphalasLevel = parseFloat( $("#inputOrphalasLevel").val() || 0 );
    if( !(orphalasLevel>=0) ) {
        alert("Calculation failed. Orphalas Level must be a non-negative number.");
        return -1;
    }
    orphalasLevel = Math.floor(orphalasLevel);
    var senakhanLevel = parseFloat( $("#inputSenakhanLevel").val() || 0 );
    if( !(senakhanLevel>=0) ) {
        alert("Calculation failed. Sen-Akhan Level must be a non-negative number.");
        return -1;
    }
    senakhanLevel = Math.floor(senakhanLevel);
    // return
    return [ancientSouls, zone, zoneOverride, build, custom, idleDPS, hybridDPS, activeDPS, idleGold, hybridGold, activeGold, heroSoul, skills, progression, rubies, xyliqilLevel, chorLevel, phanLevel, ponyLevel, borbLevel, rhageistLevel, kariquaLevel, orphalasLevel, senakhanLevel];
}
      
/*
function test() {
    var cases = [0,1,10,100,1000,10000,12500,15000,17500,20000,50000,100000,200000,300000,400000,500000];
        readout = "[\n";
    for (i=0;i<cases.length;i++) {
        readout += "    " + refresh(true,cases[i],false) + ",\n";
    }
    for (i=0;i<cases.length;i++) {
        readout += "    " + refresh(true,cases[i],true) + ",\n";
    }
    readout = readout.slice(0, -2);
    readout += "\n]";
    console.log(readout);
}
*/
$("#inputAncientSouls").keyup(function(ev) {
    if (ev.which === 13) refresh();
});

function changeTheme() {
    $("#theme").attr("href", $("#dark").is(":checked")
        ? "css/dark.css"
        : "css/light.css"
    );
}
/*
$(setDefaults)
*/
