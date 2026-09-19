// R6 removable carrier, insulating module tier and service fixtures.
// Supports touch PCB edge lands only. All sockets, wires and fitted stock need dry fit.
module small_post(p,h,r=2.5) {
    translate([p[0],p[1],0]) difference() {
        cylinder(r=r,h=h);
        translate([0,0,-1.8]) cylinder(d=1.7,h=h+1.9);
    }
}
module product_body_mounts() {
    for(p=tray_mounts) small_post(p,1);
    for(p=tier_mounts) small_post(p,tier_z-1.6);
    for(p=battery_mounts) small_post(p,2,r=1.8);
    for(p=connector_mounts) small_post(p,1);
    // Smooth low pouch stops: no clamp pressure or screws over the pouch.
    for(p=[[61,18],[97,18],[61,86],[97,86]])
        translate([p[0],p[1],0]) cube([2,1,3]);
    for(x=[60.8,99]) for(y=[22,79])
        translate([x,y,0]) cube([1.2,5,3]);
}
module carrier_tray() {
    difference() {
        union() {
            translate([1.5,20.5,1]) cube([55.5,67.5,1.2]);
            for(p=tray_mounts) translate([p[0],p[1],1]) cylinder(r=2.5,h=1.2);
            // Lower ledges and outside walls, interrupted at body retaining tabs.
            for(range=[[22,31],[38,71],[78,85.02]])
                translate([2.0,range[0],2.2]) cube([1.8,range[1]-range[0],bz-2.2]);
            translate([49.98,22,2.2]) cube([1.8,63.02,bz-2.2]);
            for(y=[24,44,64]) {
                translate([2.0,y,bz]) cube([0.75,6,2.15]);
                translate([2.0,y,bz+bt+fit]) cube([1.8,6,0.8]);
                translate([51.03,y,bz]) cube([0.75,6,2.15]);
                translate([49.98,y,bz+bt+fit]) cube([1.8,6,0.8]);
            }
            // Closed front end; rear keeper is removable.
            translate([2,20.5,2.2]) cube([49.78,1.25,bz+bt+fit-2.2]);
            for(x=[20,36]) translate([x,86.75,2.2]) difference() {
                cylinder(r=1.7,h=bz-2.2);
                cylinder(d=1.7,h=12);
            }
        }
        for(p=tray_mounts) {
            translate([p[0],p[1],0.9]) cylinder(d=2.3,h=2);
            translate([p[0],p[1],2.2]) cylinder(r=2.0,h=1.4);
        }
        for(y=[26,56,74]) translate([49, y, 3.2]) cube([4,8,4]);
        // Tier supports rise from case independently of the removable cassette.
        for(p=tier_mounts) translate([p[0],p[1],0]) cylinder(r=2.8,h=40);
    }
}
module carrier_keeper() {
    difference() {
        union() {
            translate([18,84.22,bz+bt+fit]) cube([24,3.78,1.6]);
            for(x=[20,36]) translate([x,86.75,bz]) cylinder(r=1.7,h=bt+fit+0.1);
        }
        for(x=[20,36]) translate([x,86.75,bz-0.1]) cylinder(d=2.3,h=5);
    }
}
module seat_rim(s) {
    x=s[0]; y=s[1]; w=s[2]; d=s[3];
    difference() {
        translate([x-1.6,y-1.6,tier_z-1.6]) cube([w+3.2,d+3.2,1.6]);
        translate([x+0.8,y+0.8,tier_z-1.7]) cube([w-1.6,d-1.6,1.8]);
    }
    // Short charger keepers leave its left-facing USB mouth unobstructed.
    keeper_l=(s==module_seats[1]) ? 2 : 3;
    keeper_inset=(s==module_seats[1]) ? 0.25 : 1;
    if(x < 20) for(yy=[y+keeper_inset,y+d-keeper_inset-keeper_l]) {
        translate([x-1.6,yy,tier_z]) cube([1.35,keeper_l,2.65]);
        translate([x-1.6,yy,tier_z+1.85]) cube([2.4,keeper_l,0.8]);
    }
    else {
        translate([x+3,y-1.6,tier_z]) cube([3,1.35,2.65]);
        translate([x+3,y-1.6,tier_z+1.85]) cube([3,2.4,0.8]);
    }
    // Corner guides stop below the board top. Pigtails leave through open sides.
    for(xx=[x-1.6,x+w+fit]) for(yy=[y,y+d-3])
        translate([xx,yy,tier_z]) cube([1.35,3,1.5]);
}
module module_tier() {
    difference() {
        union() {
            for(s=module_seats) seat_rim(s);
            // One connected insulating perimeter, with the left USB edge open.
            translate([1,20.5,tier_z-1.6]) cube([53,1.7,1.6]);
            translate([38,20.5,tier_z-1.6]) cube([3,67.5,1.6]);
            translate([1,84.9,tier_z-1.6]) cube([53,3.1,1.6]);
            for(y=[40.7,module_seats[1][1]-1.6,module_seats[1][1]+module_seats[1][3]+0.1,74.5,85])
                translate([1,y,tier_z-1.6]) cube([40,1.5,1.6]);
            for(p=tier_mounts) hull() {
                translate([p[0],p[1],tier_z-1.6]) cylinder(r=2.7,h=1.6);
                translate([p[0],p[1]<22 ? 21.3 : 86.1,tier_z-1.6]) cylinder(r=2.7,h=1.6);
            }
            for(s=module_seats) for(y=[s[1]+2,s[1]+s[3]-2])
                translate([s[0]+s[2]+1.8,y,tier_z-1.6]) cylinder(r=1.55,h=3.45);
        }
        for(p=tier_mounts) translate([p[0],p[1],tier_z-2]) cylinder(d=2.3,h=8);
        for(s=module_seats) for(y=[s[1]+2,s[1]+s[3]-2])
            translate([s[0]+s[2]+1.8,y,tier_z-2]) cylinder(d=1.7,h=8);
        // Keep edge overhangs within the left inside face of the body.
        translate([-20,0,0]) cube([20.15,120,50]);
    }
}
module module_clamp(i) {
    s=module_seats[i];
    difference() {
        translate([s[0]+s[2]-0.8,s[1],tier_z+1.85]) cube([4.5,s[3],1.2]);
        if(i==0) translate([s[0]+s[2]-1,s[1]+4,tier_z+1.7]) cube([1.3,10,2]);
        for(y=[s[1]+2,s[1]+s[3]-2])
            translate([s[0]+s[2]+1.8,y,tier_z+1.5]) cylinder(d=2.3,h=4);
    }
}
module connector_saddles() {
    difference() {
        union() {
            translate([17,87.5,1]) cube([79,21,2]);
            for(s=[[21,92,18,10],[43,92,18,10],[69,88,20,20]]) {
                translate([s[0]-0.8,s[1]-0.8,3]) cube([s[2]+1.6,0.8,4]);
                translate([s[0]-0.8,s[1]+s[3],3]) cube([s[2]+1.6,0.8,4]);
                // Open ends allow withdrawal; insulated tie secures housing, not latch.
            }
        }
        for(p=connector_mounts) translate([p[0],p[1],0.9]) cylinder(d=2.3,h=8);
        // Clearance for the two 1.6 mm pack leads ahead of the LED housing.
        for(x=[75,79]) translate([x-1.2,87.1,2.9]) cube([2.4,0.8,4.3]);
        translate([16,87,0.8]) cube([42,1.5,3]);
        for(p=tier_mounts) translate([p[0],p[1],0]) cylinder(r=2.8,h=10);
        for(s=[[21,92,18,10],[43,92,18,10],[69,88,20,20]])
            for(y=[s[1]-1.6,s[1]+s[3]+0.8])
                translate([s[0]+s[2]/2+0.4,y,0.8]) cube([2.8,0.8,2.4]);
    }
}
module battery_bridge() {
    difference() {
        union() {
            translate([58,48,13.5]) cube([44,8,2]);
            translate([58,48,2]) cube([3.5,8,11.5]);
            translate([98.5,48,2]) cube([3.5,8,11.5]);
        }
        for(p=battery_mounts) translate([p[0],p[1],1.9]) cylinder(d=2.3,h=16);
    }
}
module battery_insert() {
    // Optional 42 x 25 x 10 mm pack insert; remove for the 3000 mAh pack.
    translate([62,19,1]) cube([36,67,0.8]);
    translate([65.5,29,1.8]) difference() {
        cube([29,46,3]);
        translate([1.5,1.5,-0.1]) cube([26,43,3.2]);
        translate([10,43,-0.1]) cube([9,4,3.2]);
    }
}
module product_part(p) {
    if(p=="carrier_tray") carrier_tray();
    else if(p=="carrier_keeper") carrier_keeper();
    else if(p=="module_tier") module_tier();
    else if(p=="clamp_esp") module_clamp(0);
    else if(p=="clamp_charger") module_clamp(1);
    else if(p=="clamp_reg5") module_clamp(2);
    else if(p=="clamp_reg12") module_clamp(3);
    else if(p=="connector_saddles") connector_saddles();
    else if(p=="battery_bridge") battery_bridge();
    else if(p=="battery_insert") battery_insert();
}
module product_print(p) {
    if(p=="carrier_tray" || p=="connector_saddles" || p=="battery_insert") translate([0,0,-1]) product_part(p);
    else if(p=="carrier_keeper") translate([0,90,bz+bt+fit+1.6]) rotate([180,0,0]) product_part(p);
    else if(p=="module_tier") translate([0,0,-tier_z+1.6]) product_part(p);
    else if(p=="battery_bridge") translate([0,56,15.5]) rotate([180,0,0]) product_part(p);
    else translate([0,0,-tier_z-1.85]) product_part(p);
}
