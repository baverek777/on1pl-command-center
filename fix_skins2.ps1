$base = "C:\Program Files (x86)\Steam\steamapps\common\War Thunder\UserSkins"
$folders = @(
    "Modern Green Camo T90 M",
    "Leopard Camo T80 BVM",
    "Modern Green Camo T80 BVM",
    "Worn Gold T80 BVM",
    "Green EMR Camo S1"
)

function Get-ExpectedFiles($folder) {
    switch -Wildcard ($folder) {
        "*T90 M*" {
            return @(
                "t_90m_body_c.dds","t_90m_body_n.DDS",
                "t_90m_add_body_c.dds","t_90m_add_body_n.DDS",
                "t_90m_gun_c.dds","t_90m_gun_n.DDS",
                "t_90m_turret_c.dds","t_90m_turret_n.DDS",
                "mg_6p49_kord_c.DDS","mg_6p49_kord_n.DDS",
                "mg_6p49_kord_ammo_c.DDS","mg_6p49_kord_ammo_n.DDS",
                "mg_pkt_c.DDS","mg_pkt_n.DDS",
                "net_f_c.DDS","net_f_n.DDS","net_h_c.DDS","net_h_n.DDS",
                "headlight_glass_c.dds","headlight_glass_n.DDS",
                "us_turret_glass_c.DDS","us_turret_glass_n.DDS"
            )
        }
        "*T80 BVM*" {
            return @(
                "t_80bvm_body_c.dds","t_80bvm_body_n.DDS",
                "t_80bvm_gun_c.dds","t_80bvm_gun_n.DDS",
                "t_80bvm_turret_c.dds","t_80bvm_turret_n.DDS",
                "t_80bvm_armor_c.dds","t_80bvm_armor_n.DDS",
                "t_80bvm_armor_mod_c.dds","t_80bvm_armor_mod_n.DDS",
                "mg_nsvt_c.DDS","mg_nsvt_n.DDS",
                "mg_mount_nsvt_t_80_c.dds","mg_mount_nsvt_t_80_n.DDS",
                "mg_pkt_c.DDS","mg_pkt_n.DDS",
                "net_b_c.DDS","net_b_n.DDS",
                "headlight_glass_c.dds","headlight_glass_n.DDS",
                "headlight_ik_glass_c.DDS","headlight_ik_glass_n.DDS",
                "smooth_barrel_a_c.DDS","smooth_barrel_a_n.DDS"
            )
        }
        "*S1" {
            return @(
                "pantsyr_s1_body_c.DDS","pantsyr_s1_body_n.DDS",
                "pantsyr_s1_turret_c.DDS","pantsyr_s1_turret_n.DDS",
                "net_c_c.DDS","net_c_n.DDS",
                "net_f_c.DDS","net_f_n.DDS",
                "us_turret_glass_c.DDS","us_turret_glass_n.DDS"
            )
        }
        default { return @() }
    }
}

foreach ($folder in $folders) {
    $dir = Join-Path $base $folder
    $expected = Get-ExpectedFiles $folder
    foreach ($file in $expected) {
        $full = Join-Path $dir $file
        if (-not (Test-Path $full)) {
            $prefixed = Join-Path $dir "user_$file"
            if (Test-Path $prefixed) {
                Copy-Item $prefixed $full
                Write-Host "Copied missing $file from user_ version in $folder" -ForegroundColor Green
            } else {
                Write-Host "WARNING: $file missing in $folder and no user_ version found" -ForegroundColor Red
            }
        }
    }
    # Write correct BLK file
    $blkPath = Join-Path $dir "ussr_t_$(if($folder -like '*T90*'){'90m_2020'} elseif($folder -like '*T80*'){'80bvm'} else {'pantsyr_s1'}).blk"
    switch -Wildcard ($folder) {
        "*T90 M*" {
            $blkContent = @'
name:t="user"

set_tex{ from:t="t_90m_body_c*" to:t="t_90m_body_c.dds" param:t="camo_skin_tex" }
replace_tex{ from:t="t_90m_body_n*" to:t="t_90m_body_n.DDS" }
set_tex{ from:t="t_90m_add_body_c*" to:t="t_90m_add_body_c.dds" param:t="camo_skin_tex" }
replace_tex{ from:t="t_90m_add_body_n*" to:t="t_90m_add_body_n.DDS" }
set_tex{ from:t="t_90m_turret_c*" to:t="t_90m_turret_c.dds" param:t="camo_skin_tex" }
replace_tex{ from:t="t_90m_turret_n*" to:t="t_90m_turret_n.DDS" }
set_tex{ from:t="t_90m_gun_c*" to:t="t_90m_gun_c.dds" param:t="camo_skin_tex" }
replace_tex{ from:t="t_90m_gun_n*" to:t="t_90m_gun_n.DDS" }
set_tex{ from:t="mg_6p49_kord_c*" to:t="mg_6p49_kord_c.DDS" param:t="camo_skin_tex" }
replace_tex{ from:t="mg_6p49_kord_n*" to:t="mg_6p49_kord_n.DDS" }
set_tex{ from:t="mg_6p49_kord_ammo_c*" to:t="mg_6p49_kord_ammo_c.DDS" param:t="camo_skin_tex" }
replace_tex{ from:t="mg_6p49_kord_ammo_n*" to:t="mg_6p49_kord_ammo_n.DDS" }
set_tex{ from:t="mg_pkt_c*" to:t="mg_pkt_c.DDS" param:t="camo_skin_tex" }
replace_tex{ from:t="mg_pkt_n*" to:t="mg_pkt_n.DDS" }
replace_tex{ from:t="net_f_c*" to:t="net_f_c.DDS" }
replace_tex{ from:t="net_f_n*" to:t="net_f_n.DDS" }
replace_tex{ from:t="net_h_c*" to:t="net_h_c.DDS" }
replace_tex{ from:t="net_h_n*" to:t="net_h_n.DDS" }
replace_tex{ from:t="headlight_glass_c*" to:t="headlight_glass_c.dds" }
replace_tex{ from:t="headlight_glass_n*" to:t="headlight_glass_n.DDS" }
replace_tex{ from:t="us_turret_glass_c*" to:t="us_turret_glass_c.DDS" }
replace_tex{ from:t="us_turret_glass_n*" to:t="us_turret_glass_n.DDS" }
'@
        }
        "*T80 BVM*" {
            $blkContent = @'
name:t="user"

set_tex{ from:t="t_80bvm_body_c*" to:t="t_80bvm_body_c.dds" param:t="camo_skin_tex" }
replace_tex{ from:t="t_80bvm_body_n*" to:t="t_80bvm_body_n.DDS" }
set_tex{ from:t="t_80bvm_turret_c*" to:t="t_80bvm_turret_c.dds" param:t="camo_skin_tex" }
replace_tex{ from:t="t_80bvm_turret_n*" to:t="t_80bvm_turret_n.DDS" }
set_tex{ from:t="t_80bvm_gun_c*" to:t="t_80bvm_gun_c.dds" param:t="camo_skin_tex" }
replace_tex{ from:t="t_80bvm_gun_n*" to:t="t_80bvm_gun_n.DDS" }
set_tex{ from:t="t_80bvm_armor_c*" to:t="t_80bvm_armor_c.dds" param:t="camo_skin_tex" }
replace_tex{ from:t="t_80bvm_armor_n*" to:t="t_80bvm_armor_n.DDS" }
set_tex{ from:t="t_80bvm_armor_mod_c*" to:t="t_80bvm_armor_mod_c.dds" param:t="camo_skin_tex" }
replace_tex{ from:t="t_80bvm_armor_mod_n*" to:t="t_80bvm_armor_mod_n.DDS" }
set_tex{ from:t="mg_nsvt_c*" to:t="mg_nsvt_c.DDS" param:t="camo_skin_tex" }
replace_tex{ from:t="mg_nsvt_n*" to:t="mg_nsvt_n.DDS" }
set_tex{ from:t="mg_mount_nsvt_t_80_c*" to:t="mg_mount_nsvt_t_80_c.dds" param:t="camo_skin_tex" }
replace_tex{ from:t="mg_mount_nsvt_t_80_n*" to:t="mg_mount_nsvt_t_80_n.DDS" }
set_tex{ from:t="mg_pkt_c*" to:t="mg_pkt_c.DDS" param:t="camo_skin_tex" }
replace_tex{ from:t="mg_pkt_n*" to:t="mg_pkt_n.DDS" }
replace_tex{ from:t="net_b_c*" to:t="net_b_c.DDS" }
replace_tex{ from:t="net_b_n*" to:t="net_b_n.DDS" }
replace_tex{ from:t="headlight_glass_c*" to:t="headlight_glass_c.dds" }
replace_tex{ from:t="headlight_glass_n*" to:t="headlight_glass_n.DDS" }
replace_tex{ from:t="headlight_ik_glass_c*" to:t="headlight_ik_glass_c.DDS" }
replace_tex{ from:t="headlight_ik_glass_n*" to:t="headlight_ik_glass_n.DDS" }
replace_tex{ from:t="smooth_barrel_a_c*" to:t="smooth_barrel_a_c.DDS" }
replace_tex{ from:t="smooth_barrel_a_n*" to:t="smooth_barrel_a_n.DDS" }
'@
        }
        "*S1" {
            $blkContent = @'
name:t="user"

set_tex{ from:t="pantsyr_s1_body_c*" to:t="pantsyr_s1_body_c.DDS" param:t="camo_skin_tex" }
replace_tex{ from:t="pantsyr_s1_body_n*" to:t="pantsyr_s1_body_n.DDS" }
set_tex{ from:t="pantsyr_s1_turret_c*" to:t="pantsyr_s1_turret_c.DDS" param:t="camo_skin_tex" }
replace_tex{ from:t="pantsyr_s1_turret_n*" to:t="pantsyr_s1_turret_n.DDS" }
replace_tex{ from:t="net_c_c*" to:t="net_c_c.DDS" }
replace_tex{ from:t="net_c_n*" to:t="net_c_n.DDS" }
replace_tex{ from:t="net_f_c*" to:t="net_f_c.DDS" }
replace_tex{ from:t="net_f_n*" to:t="net_f_n.DDS" }
replace_tex{ from:t="us_turret_glass_c*" to:t="us_turret_glass_c.DDS" }
replace_tex{ from:t="us_turret_glass_n*" to:t="us_turret_glass_n.DDS" }
'@
        }
    }
    Set-Content -Path $blkPath -Value $blkContent -Encoding UTF8
    Write-Host "Wrote BLK for $folder" -ForegroundColor Cyan
}
Write-Host "All skins fixed - required DDS files present and BLK files updated." -ForegroundColor Green
