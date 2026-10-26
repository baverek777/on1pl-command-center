import struct, os

base = r'C:\Program Files (x86)\Steam\steamapps\common\War Thunder\UserSkins'

skins = {
    'T90M body':      (r'Modern Green Camo T90 M',   'user_t_90m_body_c.DDS'),
    'T80 Leopard body': (r'Leopard Camo T80 BVM',    'user_t_80bvm_body_c.dds'),
    'T80 WornGold body':(r'Worn Gold T80 BVM',       'user_t_80bvm_body_c.DDS'),
    'Pancyr body':    (r'Green EMR Camo S1',          'user_pantsyr_s1_body_c.DDS'),
}

for name, (folder, file) in skins.items():
    path = os.path.join(base, folder, file)
    with open(path, 'rb') as f:
        magic = f.read(4)
        header = f.read(124)
        height  = struct.unpack_from('<I', header, 8)[0]
        width   = struct.unpack_from('<I', header, 12)[0]
        mips    = struct.unpack_from('<I', header, 20)[0]
        pf_fourcc = header[80:84]
        # Skip to pixel data
        f.seek(128)
        # Read first 1024 bytes of compressed pixel data
        sample = list(f.read(1024))
        avg = sum(sample) / len(sample)
        variance = sum((v - avg)**2 for v in sample) / len(sample)
        # Low variance = probably flat/solid color = no camo pattern
        print(f"{name}:")
        print(f"  Size: {width}x{height}, mips={mips}, fourcc={pf_fourcc}")
        print(f"  Pixel sample avg={avg:.1f}, variance={variance:.1f}")
        print(f"  Pattern richness: {'GOOD - has variation' if variance > 500 else 'WARNING - flat/monotone texture'}")
        print()
