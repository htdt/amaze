'''
All constant data used in the package should be defined here.
'''

from collections import OrderedDict as BASE_DICT

BLENDING_TYPES = type('Blending', (), {
    'NONE': 'NoBlending',
    'NORMAL': 'NormalBlending',
    'ADDITIVE': 'AdditiveBlending',
    'SUBTRACTIVE': 'SubtractiveBlending',
    'MULTIPLY': 'MultiplyBlending',
    'CUSTOM': 'CustomBlending'
})

NEAREST_FILTERS = type('NearestFilters', (), {
    'NEAREST': 'NearestFilter',
    'MIP_MAP_NEAREST': 'NearestMipMapNearestFilter',
    'MIP_MAP_LINEAR': 'NearestMipMapLinearFilter'
})

LINEAR_FILTERS = type('LinearFilters', (), {
    'LINEAR': 'LinearFilter',
    'MIP_MAP_NEAREST': 'LinearMipMapNearestFilter',
    'MIP_MAP_LINEAR': 'LinearMipMapLinearFilter'
})

MAPPING_TYPES = type('Mapping', (), {
    'UV': 'UVMapping',
    'CUBE_REFLECTION': 'CubeReflectionMapping',
    'CUBE_REFRACTION': 'CubeRefractionMapping',
    'SPHERICAL_REFLECTION': 'SphericalReflectionMapping'
})

JSON = 'json'
EXTENSION = '.%s' % JSON
INDENT = 'indent'


MATERIALS = 'materials'
SCENE = 'scene'
VERTICES = 'vertices'
FACES = 'faces'
NORMALS = 'normals'
BONES = 'bones'
UVS = 'uvs'
COLORS = 'colors'
MIX_COLORS = 'mixColors'
SCALE = 'scale'
COMPRESSION = 'compression'
MAPS = 'maps'
FRAME_STEP = 'frameStep'
FRAME_INDEX_AS_TIME = 'frameIndexAsTime'
ANIMATION = 'animations'
MORPH_TARGETS = 'morphTargets'
POSE = 'pose'
REST = 'rest'
SKIN_INDICES = 'skinIndices'
SKIN_WEIGHTS = 'skinWeights'
LOGGING = 'logging'
CAMERAS = 'cameras'
LIGHTS = 'lights'
HIERARCHY = 'hierarchy'
FACE_MATERIALS = 'faceMaterials'
SKINNING = 'skinning'
COPY_TEXTURES = 'copyTextures'
TEXTURE_FOLDER = 'textureFolder'
ENABLE_PRECISION = 'enablePrecision'
PRECISION = 'precision'
DEFAULT_PRECISION = 6
EMBED_GEOMETRY = 'embedGeometry'
EMBED_ANIMATION = 'embedAnimation'
OFF = 'off'

GLOBAL = 'global'
BUFFER_GEOMETRY = 'BufferGeometry'
GEOMETRY = 'geometry'
GEOMETRY_TYPE = 'geometryType'

CRITICAL = 'critical'
ERROR = 'error'
WARNING = 'warning'
INFO = 'info'
DEBUG = 'debug'

NONE = 'None'
MSGPACK = 'msgpack'

PACK = 'pack'

INFLUENCES_PER_VERTEX = 'influencesPerVertex'

EXPORT_OPTIONS = {
    FACES: True,
    VERTICES: True,
    NORMALS: True,
    UVS: True,
    COLORS: False,
    MATERIALS: False,
    FACE_MATERIALS: False,
    SCALE: 1,
    FRAME_STEP: 1,
    FRAME_INDEX_AS_TIME: False,
    SCENE: False,
    MIX_COLORS: False,
    COMPRESSION: None,
    MAPS: False,
    ANIMATION: OFF,
    BONES: False,
    SKINNING: False,
    MORPH_TARGETS: False,
    CAMERAS: False,
    LIGHTS: False,
    HIERARCHY: False,
    COPY_TEXTURES: True,
    TEXTURE_FOLDER: '',
    LOGGING: DEBUG,
    ENABLE_PRECISION: True,
    PRECISION: DEFAULT_PRECISION,
    EMBED_GEOMETRY: True,
    EMBED_ANIMATION: True,
    GEOMETRY_TYPE: GEOMETRY,
    INFLUENCES_PER_VERTEX: 2,
    INDENT: True
}


FORMAT_VERSION = 4.3
VERSION = 'version'
THREE = 'io_three'
GENERATOR = 'generator'
SOURCE_FILE = 'sourceFile'
VALID_DATA_TYPES = (str, int, float, bool, list, tuple, dict)

JSON = 'json'
GZIP = 'gzip'

EXTENSIONS = {
    JSON: '.json',
    MSGPACK: '.pack',
    GZIP: '.gz'
}

METADATA = 'metadata'
GEOMETRIES = 'geometries'
IMAGES = 'images'
TEXTURE = 'texture'
TEXTURES = 'textures'

USER_DATA = 'userData'
DATA = 'data'
TYPE = 'type'

MATERIAL = 'material'
OBJECT = 'object'
PERSPECTIVE_CAMERA = 'PerspectiveCamera'
ORTHOGRAPHIC_CAMERA = 'OrthographicCamera'
AMBIENT_LIGHT = 'AmbientLight'
DIRECTIONAL_LIGHT = 'DirectionalLight'
AREA_LIGHT = 'AreaLight'
POINT_LIGHT = 'PointLight'
SPOT_LIGHT = 'SpotLight'
HEMISPHERE_LIGHT = 'HemisphereLight'
MESH = 'Mesh'
EMPTY = 'Empty'
SPRITE = 'Sprite'

DEFAULT_METADATA = {
    VERSION: FORMAT_VERSION,
    TYPE: OBJECT.title(),
    GENERATOR: THREE
}

UUID = 'uuid'

MATRIX = 'matrix'
POSITION = 'position'
QUATERNION = 'quaternion'
ROTATION = 'rotation'
SCALE = 'scale'

UV = 'uv'
ATTRIBUTES = 'attributes'
NORMAL = 'normal'
ITEM_SIZE = 'itemSize'
ARRAY = 'array'

FLOAT_32 = 'Float32Array'

VISIBLE = 'visible'
CAST_SHADOW = 'castShadow'
RECEIVE_SHADOW = 'receiveShadow'
QUAD = 'quad'

USER_DATA = 'userData'

MASK = {
    QUAD: 0,
    MATERIALS: 1,
    UVS: 3,
    NORMALS: 5,
    COLORS: 7
}


CHILDREN = 'children'

URL = 'url'
WRAP = 'wrap'
REPEAT = 'repeat'
WRAPPING = type('Wrapping', (), {
    'REPEAT': 'RepeatWrapping',
    'CLAMP': 'ClampToEdgeWrapping',
    'MIRROR': 'MirroredRepeatWrapping'
})
ANISOTROPY = 'anisotropy'
MAG_FILTER = 'magFilter'
MIN_FILTER = 'minFilter'
MAPPING = 'mapping'

IMAGE = 'image'

NAME = 'name'
PARENT = 'parent'
LENGTH = 'length'
FPS = 'fps'
HIERARCHY = 'hierarchy'
POS = 'pos'
ROTQ = 'rotq'
ROT = 'rot'
SCL = 'scl'
TIME = 'time'
KEYS = 'keys'

AMBIENT = 'ambient'
COLOR = 'color'
EMISSIVE = 'emissive'
SPECULAR = 'specular'
SPECULAR_COEF = 'specularCoef'
SHININESS = 'shininess'
SIDE = 'side'
OPACITY = 'opacity'
TRANSPARENT = 'transparent'
WIREFRAME = 'wireframe'
BLENDING = 'blending'
VERTEX_COLORS = 'vertexColors'
DEPTH_WRITE = 'depthWrite'
DEPTH_TEST = 'depthTest'

MAP = 'map'
SPECULAR_MAP = 'specularMap'
LIGHT_MAP = 'lightMap'
BUMP_MAP = 'bumpMap'
BUMP_SCALE = 'bumpScale'
NORMAL_MAP = 'normalMap'
NORMAL_SCALE = 'normalScale'

#@TODO ENV_MAP, REFLECTIVITY, REFRACTION_RATIO, COMBINE

MAP_DIFFUSE = 'mapDiffuse'
MAP_DIFFUSE_REPEAT = 'mapDiffuseRepeat'
MAP_DIFFUSE_WRAP = 'mapDiffuseWrap'
MAP_DIFFUSE_ANISOTROPY = 'mapDiffuseAnisotropy'

MAP_SPECULAR = 'mapSpecular'
MAP_SPECULAR_REPEAT = 'mapSpecularRepeat'
MAP_SPECULAR_WRAP = 'mapSpecularWrap'
MAP_SPECULAR_ANISOTROPY = 'mapSpecularAnisotropy'

MAP_LIGHT = 'mapLight'
MAP_LIGHT_REPEAT = 'mapLightRepeat'
MAP_LIGHT_WRAP = 'mapLightWrap'
MAP_LIGHT_ANISOTROPY = 'mapLightAnisotropy'

MAP_NORMAL = 'mapNormal'
MAP_NORMAL_FACTOR = 'mapNormalFactor'
MAP_NORMAL_REPEAT = 'mapNormalRepeat'
MAP_NORMAL_WRAP = 'mapNormalWrap'
MAP_NORMAL_ANISOTROPY = 'mapNormalAnisotropy'

MAP_BUMP = 'mapBump'
MAP_BUMP_REPEAT = 'mapBumpRepeat'
MAP_BUMP_WRAP = 'mapBumpWrap'
MAP_BUMP_ANISOTROPY = 'mapBumpAnisotropy'
MAP_BUMP_SCALE = 'mapBumpScale'

NORMAL_BLENDING = 0

VERTEX_COLORS_ON = 2
VERTEX_COLORS_OFF = 0

THREE_BASIC = 'MeshBasicMaterial'
THREE_LAMBERT = 'MeshLambertMaterial'
THREE_PHONG = 'MeshPhongMaterial'

INTENSITY = 'intensity'
DISTANCE = 'distance'
ASPECT = 'aspect'
ANGLE = 'angle'

FOV = 'fov'
ASPECT = 'aspect'
NEAR = 'near'
FAR = 'far'

LEFT = 'left'
RIGHT = 'right'
TOP = 'top'
BOTTOM = 'bottom'

SHADING = 'shading'
COLOR_DIFFUSE = 'colorDiffuse'
COLOR_AMBIENT = 'colorAmbient'
COLOR_EMISSIVE = 'colorEmissive'
COLOR_SPECULAR = 'colorSpecular'
DBG_NAME = 'DbgName'
DBG_COLOR = 'DbgColor'
DBG_INDEX = 'DbgIndex'
EMIT = 'emit'

PHONG = 'phong'
LAMBERT = 'lambert'
BASIC = 'basic'

NORMAL_BLENDING = 'NormalBlending'

DBG_COLORS = (0xeeeeee, 0xee0000, 0x00ee00, 0x0000ee,
              0xeeee00, 0x00eeee, 0xee00ee)

DOUBLE_SIDED = 'doubleSided'

EXPORT_SETTINGS_KEY = 'threeExportSettings'
