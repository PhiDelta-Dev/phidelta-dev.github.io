function damage_multiplier(mr, flat_pen, percent_pen, cinderbloom, target_hp)
{
    var cinderbloom_reduction = 0;
    if(cinderbloom)
    {
        let range = target_hp - 1000;
        if(range < 1500)
        {
            if(range < 0) { range = 0; }
            cinderbloom_reduction = 20 - Math.ceil(range / 150);
        }
        else
        {
            cinderbloom_reduction = 10;
        }
    }

    let reduced_mr = mr * (1.0 - percent_pen / 100.0) - flat_pen - cinderbloom_reduction;
    if(reduced_mr < 0.0) { reduced_mr = 0.0; }
    return 1.0 / (1.0 + reduced_mr / 100.0);
}

function transfusion_damage(rank, ap, crimson_rush)
{
    return (crimson_rush ? 1.85 : 1.0) * (60.0 + 20.0 * rank + 0.6 * ap);
}

function sanguine_pool_damage(rank, bonus_hp)
{
    return 6.25 + 13.75 * rank + 0.025 * bonus_hp;
}

function tides_of_blood_damage(rank, ap, max_hp, channel_time)
{
    switch(channel_time)
    {
        case 0.0: return 15.0 + 15.0 * rank + 0.015 * max_hp + 0.35 * ap;
        case 1.0: return 30.0 + 30.0 * rank + 0.06 * max_hp + 0.8 * ap;
    }
}

function hemoplague_damage(rank, ap)
{
    return 1.1 * (50.0 + 100.0 * rank + 0.7 * ap);
}

let base_hp = [607, 686.2, 769.25, 856.15, 946.9, 1041.5, 1139.95, 1242.25, 1348.4, 1458.4, 1572.25, 1689.95, 1811.5, 1936.9, 2066.15, 2199.25, 2336.2, 2477];

function compute_damage()
{
    //Read game state
    let minute = Number(document.forms["form_input"]["minute"].value);
    let level = Number(document.forms["form_input"]["level"].value);
    let rank_transfusion = Number(document.forms["form_input"]["rank_transfusion"].value);
    let rank_sanguine_pool = Number(document.forms["form_input"]["rank_sanguine_pool"].value);
    let rank_tides_of_blood = Number(document.forms["form_input"]["rank_tides_of_blood"].value);
    let rank_hemoplague = Number(document.forms["form_input"]["rank_hemoplague"].value);
    let glory = Number(document.forms["form_input"]["glory"].value);

    //Read runes
    let gathering_storm = Boolean(document.forms["form_input"]["gathering_storm"].checked);
    let ap_shard_count = Number(document.forms["form_input"]["ap_shards"].value);
    let hp_shard = Boolean(document.forms["form_input"]["hp_shard"].checked);

    //Read items
    let sorcerers_shoes = Boolean(document.forms["form_input"]["sorcerers_shoes"].checked);
    let dorans_ring = Boolean(document.forms["form_input"]["dorans_ring"].checked);
    let dark_seal = Boolean(document.forms["form_input"]["dark_seal"].checked);
    let mejais_soulstealer = Boolean(document.forms["form_input"]["mejais_soulstealer"].checked);
    let hextech_rocketbelt = Boolean(document.forms["form_input"]["hextech_rocketbelt"].checked);
    let night_harvester = Boolean(document.forms["form_input"]["night_harvester"].checked);
    let rabadons_deathcap = Boolean(document.forms["form_input"]["rabadons_deathcap"].checked);
    let horizon_focus = Boolean(document.forms["form_input"]["horizon_focus"].checked);
    let void_staff = Boolean(document.forms["form_input"]["void_staff"].checked);
    let shadowflame = Boolean(document.forms["form_input"]["shadowflame"].checked);

    //Read stats from basic & epic items
    let basic_epic_ap = Number(document.forms["form_input"]["basic_epic_ap"].value);
    let basic_epic_hp = Number(document.forms["form_input"]["basic_epic_hp"].value);
    let basic_epic_percent_pen = Number(document.forms["form_input"]["basic_epic_percent_pen"].value);

    //Read target
    let target_mr = Number(document.forms["form_input"]["target_mr"].value);
    let target_hp = Number(document.forms["form_input"]["target_hp"].value);

    //Modified stats
    var ap = 0.0;
    var bonus_hp = 0.0;  
    var flat_pen = 0;
    var percent_pen = 0;

    //Gathering Storm
    if(gathering_storm)
    {
        let ten_min = Math.floor(minute / 10);
        ap += 4 * ten_min * (ten_min + 1);
    }

    //AP shards
    ap += 9 * ap_shard_count;

    //HP shard
    if(hp_shard)
    {
        bonus_hp += 15.0 + Math.floor(125.0 * (level - 1.0) / 17.0);
    }

    //Item counters
    var legendary_count = 0;
    var magical_opus = false;
    var hypershot = false;
    var cinderbloom = false;

    //Legendary items
    if(sorcerers_shoes)
    {
        flat_pen += 18;
    }
    if(dorans_ring)
    {
        ap += 18;
        bonus_hp += 90;
    }
    if(dark_seal)
    {
        ap += 15 + 4 * glory;
        bonus_hp += 50;
    }
    if(mejais_soulstealer)
    {
        ap += 20 + 5 * glory;
        bonus_hp += 100;
        legendary_count += 1;
    }
    if(rabadons_deathcap)
    {
        ap += 120;
        magical_opus = true;
        legendary_count += 1;
    }
    if(horizon_focus)
    {
        ap += 100;
        bonus_hp += 150;
        hypershot = true;
        legendary_count += 1;
    }
    if(void_staff)
    {
        ap += 65;
        percent_pen += 40;
        legendary_count += 1;
    }
    if(shadowflame)
    {
        ap += 100;
        bonus_hp += 200;
        cinderbloom = true;
        legendary_count += 1;
    }

    //Mythic items
    if(hextech_rocketbelt)
    {
        ap += 90;
        bonus_hp += 250;
        flat_pen += 6 + 5 * legendary_count;
    }
    if(night_harvester)
    {
        ap += 90;
        bonus_hp += 300;
    }

	//Basic & epic items
	ap += basic_epic_ap;
	bonus_hp += basic_epic_hp;
	percent_pen += basic_epic_percent_pen;

    //Magical Opus & Crimson Pact
    let ap_old = ap;
    if(magical_opus)
    {
        ap += 0.4 * ap + 7.0 / 150.0 * bonus_hp;
        bonus_hp += 2.24 * ap_old + 8.0 / 375.0 * bonus_hp;
    }
    else
    {     
        ap += bonus_hp / 30.0;
        bonus_hp += ap_old * 1.6;
    }

    let max_hp = base_hp[level - 1] + bonus_hp;
    let multiplier = damage_multiplier(target_mr, flat_pen, percent_pen, cinderbloom, target_hp);

    //Output stats
    document.getElementById("result_ap").innerHTML = ap.toFixed(1);
    document.getElementById("result_hp").innerHTML = max_hp.toFixed(1);
    document.getElementById("result_flat_pen").innerHTML = flat_pen;
    document.getElementById("result_percent_pen").innerHTML = percent_pen.toString() + "%";
    document.getElementById("result_damage_multiplier").innerHTML = multiplier.toFixed(4);

    //Output damage
    if(rank_transfusion > 0)
    {
        document.getElementById("result_damage_transfusion").innerHTML = (multiplier * transfusion_damage(rank_transfusion, ap, false)).toFixed(1);
        document.getElementById("result_damage_transfusion_crimson_rush").innerHTML = (multiplier * transfusion_damage(rank_transfusion, ap, true)).toFixed(1);
    }
    else
    {
        document.getElementById("result_damage_transfusion").innerHTML = "-";
        document.getElementById("result_damage_transfusion_crimson_rush").innerHTML = "-";
    }
    if(rank_sanguine_pool > 0)
    {
        document.getElementById("result_damage_sanguine_pool").innerHTML = ((hypershot ? 1.1 : 1.0) * multiplier * sanguine_pool_damage(rank_sanguine_pool, bonus_hp)).toFixed(1);
    }
    else
    {
        document.getElementById("result_damage_sanguine_pool").innerHTML = "-";
    }
    if(rank_sanguine_pool > 0)
    {
        document.getElementById("result_damage_tides_of_blood_min").innerHTML = ((hypershot ? 1.1 : 1.0) * multiplier * tides_of_blood_damage(rank_tides_of_blood, ap, max_hp, 0.0)).toFixed(1);
        document.getElementById("result_damage_tides_of_blood_max").innerHTML = ((hypershot ? 1.1 : 1.0) * multiplier * tides_of_blood_damage(rank_tides_of_blood, ap, max_hp, 1.0)).toFixed(1);
    }
    else
    {
        document.getElementById("result_damage_tides_of_blood_min").innerHTML = "-";
        document.getElementById("result_damage_tides_of_blood_max").innerHTML = "-";
    }
    if(rank_hemoplague > 0)
    {
        document.getElementById("result_damage_hemoplague").innerHTML = (multiplier * hemoplague_damage(rank_hemoplague, ap)).toFixed(1);
    }
    else
    {
        document.getElementById("result_damage_hemoplague").innerHTML = "-";
    }

	return false;
} 