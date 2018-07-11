//
//     Copyright © 2011-2017 Cambridge Intelligence Limited.
//     All rights reserved.
//     KeyLines v3.5.3-3431 professional
//
declare module KeyLines {

  interface IdMap<T> {
    [key: string]: T
  }

  interface ChartData {
    /** A KeyLines Chart type - must be exactly 'LinkChart' */
    type: 'LinkChart',
    /** An array of nodes and links */
    items: Array<Node | Link | Shape>
  }

  interface NodeStyle {
    /** The border colour. Default: No border. */
    b?: string,
    /** The style of the border line. This can be either 'solid' or 'dashed'. Newer HTML5 browser versions support this. Default: 'solid'. */
    bs?: "solid" | "dashed",
    /** The width of the node's border. Default: 4. */
    bw?: number,
    /** Whether the node is displayed in the background. Default: false. */
    bg?: boolean,
    /** An object describing the bubble shown on the node. */
    bu?: Bubble,
    /** The fill colour. Default: No fill. */
    c?: string,
    /** Whether the image should be a cutout circle from the original image. This feature is affected by cross-origin and some SVG security restrictions. Does not apply to font icons. Default: false. */
    ci?: boolean,
    /** The 'd' parameter stands for data. Use this to store custom data on the node. */
    d?: any,
    /** An object describing the donut border shown on the node. Only applies to nodes with 'circle' shape. If both donut and b are set then donut takes precedence. */
    donut?: Donut,
    /** Whether this is a dummy node. Dummy nodes are drawn as the ends of a dumbbell, for links which typically have just been created by dragging onto the chart surface. Default: false. */
    du?: boolean,
    /** The enlargement factor for the node. Default: 1. */
    e?: number,
    /** Whether the label should be displayed in bold font. Default: false. */
    fb?: boolean,
    /** The background colour of the font. The default is a subtle effect using white with an alpha channel. */
    fbc?: string,
    /** The colour for the label font. Default: black. */
    fc?: string,
    /** The font family to use for the label. The default comes from the chart.options fontFamily setting. */
    ff?: string,
    /** The font icon used on the node. */
    fi?: FontIcon,
    /** The font size (pt) of the node label. Default: 14. */
    fs?: number,
    /** An array of objects describing the glyphs shown on the node. */
    g?: Array<Glyph>,
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha0?: Halo,
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha1?: Halo,
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha2?: Halo,
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha3?: Halo,
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha4?: Halo,
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha5?: Halo,
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha6?: Halo,
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha7?: Halo,
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha8?: Halo,
    /** The halos shown on the node. There are ten halo properties, ha0, ha1, ha2, etc., up to ha9. */
    ha9?: Halo,
    /** Whether the node is hidden. Default: false. */
    hi?: boolean,
    /** An object describing the position of the node on the map when in map mode. */
    pos?: Location,
    /** The node's shape: Either 'box', 'circle', 'e' for an east-pointing signpost, or 'w' for a west-pointing signpost. Default: 'circle'. */
    sh?: "box" | "circle" | "e" | "w",
    /** The node label. Use new lines for multiline labels. Default: No label. */
    t?: string,
    /** If the tc parameter ('text centre') is true, the label is shown in the centre of the node. If it is false then the label is shown at the bottom of the node. Default: false for shape nodes and nodes with images, true for other nodes. */
    tc?: boolean,
    /** The URL of the node image. */
    u?: string,
    /** The node position along the X-axis, in world coordinates. Default: 0. */
    x?: number,
    /** The node position along the Y-axis, in world coordinates. Default: 0. */
    y?: number
  }

  interface NodeProperties extends NodeStyle {
    /** The identity of this node. This must be unique across all items in the chart. It must not start with an underscore or end with a '\' character. */
    id: string
  }

  interface Node extends NodeProperties {
    /** The type of the item: this must be exactly 'node' for nodes. */
    type: 'node'
  }

  interface LinkStyle {
    /** Whether to show an arrow at the id1 end. Default: false. */
    a1?: boolean,
    /** Whether to show an arrow at the id2 end. Default: false. */
    a2?: boolean,
    /** The distance to back-off from end id1 as a ratio of the total length of the link line. Value in the range 0 to 1. Default: 0. */
    b1?: number,
    /** The distance to back-off from end id2 as a ratio of the total length of the link line. Value in the range 0 to 1. Default: 0. */
    b2?: number,
    /** Whether the link is displayed in the background. Default: false. */
    bg?: boolean,
    /** An object describing the bubble shown on the link. */
    bu?: Bubble,
    /** The colour of the link line itself. Default: grey. */
    c?: string,
    /** The 'd' parameter stands for data. Use this to store custom data on the link. */
    d?: any,
    /** Whether the label should be displayed in bold font. Default: false. */
    fb?: boolean,
    /** The background colour of the font. The default is a subtle effect using white with an alpha channel. */
    fbc?: string,
    /** The colour for the label font. Default: black. */
    fc?: string,
    /** The font family to use for the label. The default comes from the chart.options fontFamily setting. */
    ff?: string,
    /** The font size (pt) of the link label. Default: 14. */
    fs?: number,
    /** An array of objects describing the glyphs shown on the link. */
    g?: Array<Glyph>,
    /** Whether the link is hidden. Default: false. */
    hi?: boolean,
    /** The style of the link line. This can be either 'solid', 'dashed' or 'dotted'. Newer HTML5 browser versions support this. Default: 'solid'. */
    ls?: "solid" | "dashed" | "dotted",
    /** Specifies the offset of the midpoint of the link, and so controls how curved the link is. A zero offset gives a straight line for links between two different nodes, and a standard curve for "self links". Default: 0. */
    off?: number,
    /** The link style. If 'h', the link is a horizontal link, with a central section at a specified y-position, and diagonal sections at each end. Otherwise, the link is a standard link. */
    st?: "h",
    /** The link label. Use new lines for multiline labels. */
    t?: string,
    /** The width of the link line. Default: 1. */
    w?: number,
    /** The position of the central section of the link along the Y-axis, in world coordinates. Only applies when the st property is 'h'. Default: 0. */
    y?: number
  }

  interface LinkProperties extends LinkStyle {
    /** The identity of this link. This must be unique across all items in the chart. It must not end with a '\' character. */
    id: string
  }

  interface Link extends LinkProperties {
    /** The identity of the node at one end of the link. */
    id1: string,
    /** The identity of the node at the other end of the link. This may be the same as id1 to create a "self link" if the selfLinks chart option is enabled. */
    id2: string,
    /** The type of the item: this must be exactly 'link' for links. */
    type: 'link'
  }

  interface ShapeStyle {
    /** The border colour. Default: No border. */
    b?: string,
    /** The style of the border line. This can be either 'solid' or 'dashed'. Newer HTML5 browser versions support this. Default: 'solid'. */
    bs?: "solid" | "dashed",
    /** The width of the node's border. Default: 4. */
    bw?: number,
    /** Whether the node is displayed in the background. Default: false. */
    bg?: boolean,
    /** An object describing the bubble shown on the node. */
    bu?: Bubble,
    /** The fill colour. Default: No fill. */
    c?: string,
    /** The 'd' parameter stands for data. Use this to store custom data on the node. */
    d?: any,
    /** Whether the label should be displayed in bold font. Default: false. */
    fb?: boolean,
    /** The background colour of the font. The default is a subtle effect using white with an alpha channel. */
    fbc?: string,
    /** The colour for the label font. Default: 'black'. */
    fc?: string,
    /** The font family to use for the label. The default comes from the chart.options fontFamily setting. */
    ff?: string,
    /** The font icon used on the node. */
    fi?: FontIcon,
    /** The font size (pt) of the node label. Default: 14. */
    fs?: number,
    /** An array of objects describing the glyphs shown on the shape. */
    g?: Array<Glyph>,
    /** The height of the shape in world coordinates. Default: 0. */
    h?: number,
    /** Whether the node is hidden. Default: false. */
    hi?: boolean,
    /** The position of the node on the map when in map mode. */
    pos?: Location,
    /** Whether resize handles should be shown. Default: false. */
    re?: boolean,
    /** For shape nodes, the sh property may only be 'box' or 'circle'. Default: 'box'. */
    sh?: "box" | "circle",
    /** The node label. Use new lines for multiline labels. Default: No label. */
    t?: string,
    /** If the tc parameter ('text centre') is true, the label is shown in the centre of the node. If it is false then the label is shown at the bottom of the node. Default: false for shape nodes and nodes with images, true for other nodes.. */
    tc?: boolean,
    /** The URL of the node image. */
    u?: string,
    /** The width of the shape in world coordinates. */
    w?: number,
    /** The node position along the X-axis, in world coordinates. Default: 0. */
    x?: number,
    /** The node position along the Y-axis, in world coordinates. Default: 0. */
    y?: number
  }

  interface ShapeProperties extends ShapeStyle {
    /** The identity of this node. This must be unique across all items in the chart. It must not start with an underscore or end with a '\' character. */
    id: string
  }

  interface Shape extends ShapeProperties {
    /** The height of the shape in world coordinates. Default: 0. */
    h: number,
    /** The type of the item: this must be exactly 'node' for nodes. */
    type: 'node',
    /** The width of the shape in world coordinates. */
    w: number
  }

  interface Bubble {
    /** The colour of the bubble border. Default: grey. */
    b?: string,
    /** The colour of the bubble fill. Default: 'white'. */
    c?: string,
    /** Whether the bubble text should be displayed in bold font. Default: false. */
    fb?: boolean,
    /** The colour for the bubble text font. Default: 'black'. */
    fc?: string,
    /** The font family to use for the bubble text. The default comes from the chart.options fontFamily setting. */
    ff?: string,
    /** The font size (pt) of the bubble text. Default: 14. */
    fs?: number,
    /** An object describing the glyph shown in the bubble. Note that this is a single object, not an array. */
    g?: Glyph,
    /** The position of the bubble relative to the node or link. Four positions are supported -
    'ne', 'se', 'sw' and 'nw'. Default: 'ne'. */
    p?: "ne" | "se" | "sw" | "nw",
    /** The text for the bubble. */
    t: string
  }

  interface Glyph {
    /** Set to True for an animated glyph. Default: false. */
    a?: boolean,
    /** The colour of the glyph border. Default: grey. */
    b?: string,
    /** The colour of the glyph fill.  If colour is specified then the image will be shown inside the glyph. If no colour is specified then the image replaces the glyph circle and no label is shown. */
    c?: string,
    /** The enlargement factor for the glyph. Default: 1. */
    e?: number,
    /** Whether the glyph's label should be displayed in bold. Default: true. */
    fb?: boolean,
    /** The font colour for the glyph's label. Default: 'white'. */
    fc?: string,
    /** The font family to use for the glyph's label. The default comes from the chart.options fontFamily setting. */
    ff?: string,
    /** The font icon to use as a glyph. */
    fi?: FontIcon,
    /** The position of the glyph relative to the node. Four positions are supported - 'ne', 'se', 'sw' and 'nw'. Glyph positions are only supported on nodes. Links draw glyphs in the order of the array. Bubbles only draw a single glyph, at the left of the bubble. */
    p?: "ne" | "se" | "sw" | "nw",
    /** The label for the glyph. If a label is specified then it takes precedence over the image. For standard glyphs, with 'w' false, a maximum of four characters can be shown. For wide glyphs, with 'w' true,
    a maximum of 25 characters can be shown. Longer labels are truncated. */
    t?: string,
    /** The URL of the image to use for the glyph. The image can be any size, but 64X64 should be adequate. */
    u?: string,
    /** Specifies if the glyph should extend wider on nodes only (and become a rounded rectangle, as opposed to staying as a circle). Default: false. */
    w?: boolean
  }

  interface FontIcon {
    /** The colour of the font icon fill. Default: 'black'. */
    c?: string,
    /** The font family to use for the font icon. The default comes from the chart.options iconFontFamily setting. */
    ff?: string,
    /** The font icon to show. If the content is a string then it will be directly shown. Otherwise the value will be used to find the appropriate font icon within the UNICODE space. */
    t: string | number
  }

  interface Halo {
    /** The colour of the halo. */
    c: string,
    /** The radius of the halo. */
    r: number,
    /** The width of the halo. */
    w: number
  }

  interface Donut {
    /** The colour of the border between donut segments. Default: 'white'. */
    b?: string,
    /** The width of the border between donut segments. Default: 2. */
    bw?: number,
    /** An array giving the colour of each segment. It should contain the same number of elements as the v array. If not supplied, a default set of colours is used. Default: standard colours. */
    c?: Array<string>,
    /** An array giving the size of each segment. Values should be positive. Segments are positioned clockwise around the node starting at the top. */
    v: Array<number>,
    /** The width of the donut segments. This doesn't include the border. Default: 10. */
    w?: number
  }

  interface Location {
    /** The latitude in degrees that this node is positioned at when a map is shown. Must be in the range -90 to 90. */
    lat: number,
    /** The longitude in degrees that this node is positioned at when a map is shown. Must be in the range -180 to 180. */
    lng: number
  }

  interface TimeBarData {
    /** This is the object for loading data into the time bar. */
    items: Array<TimeBarItem>
  }

  interface TimeBarItem {
    /** The timestamp or timestamps associated with this item. Either a single timestamp or an array of timestamps may be supplied. Each timestamp may be either a JavaScript Date object or a millisecond number. */
    dt: Date | number | Array<Date | number>,
    /** The identity that this item is associated with. It must not end with a '\' character. */
    id: string,
    /** The value associated with each timestamp, for example, the amount of a transaction.
    Values should be greater than zero. The same number of values should be supplied as the number of timestamps. If values are not supplied, then the time bar counts the number of timestamps, instead of adding up the corresponding values. Default: 1. */
    v?: number | Array<number>
  }

  interface AnimatePropertiesOptions {
    /** The time the animation should take, in milliseconds. Default: 1000. */
    time?: number,
    /** The easing function to use: either 'linear' or 'cubic'. Default: 'linear'. */
    easing?: "linear" | "cubic",
    /** If true, the animation is queued until all previous queued animations have completed. If false, the animation begins immediately. Default: true. */
    queue?: boolean
  }

  interface ArrangeOptions {
    /** Whether the result should be animated. Default: true. */
    animate?: boolean,
    /** Fit the chart into the window at the end of the arrangement. Default: false. */
    fit?: boolean,
    /** Controls the position of the arranged nodes. The options are: 'absolute', 'average' or 'tidy'. Default: 'average'. */
    position?: "absolute" | "average" | "tidy",
    /** A number (0 -> 10) which controls how close the nodes should be. Higher values make the nodes closer. Default: 5. */
    tightness?: number,
    /** If animated, the time the animation should take, in milliseconds. Default: 700. */
    time?: number,
    /** When position is set to absolute, the x coordinate of the centre of the nodes. Default: 0. */
    x?: number,
    /** When position is set to absolute, the y coordinate of the centre of the nodes. Default: 0. */
    y?: number
  }

  interface ShapeOptions {
    /** The height of the shape. */
    h: number,
    /** The type of shape: either 'box' or 'circle'. Default: 'box'. */
    sh?: "box" | "circle",
    /** The width of the shape. */
    w: number,
    /** The centre of the shape along the X-axis. */
    x: number,
    /** The centre of the shape along the Y-axis. */
    y: number
  }

  interface CreateLinkOptions {
    /** An object describing the style of the new link. Any non-required Link object properties can be passed (i.e., all except for id, id1, id2 and type). */
    style?: LinkStyle
  }

  interface EachOptions {
    /** Either 'all', 'node', or 'link'. Default: 'all'. */
    type?: "node" | "link" | "all"
  }

  interface ExpandLayoutOptions {
    /** The name of the layout to apply - 'standard', 'hierarchy', 'radial' or 'tweak'. By default it applies the 'standard' layout, but without performing the fit chart to window and tidy options. Other layouts are not supported. Default: 'standard'. */
    name?: "standard" | "hierarchy" | "radial" | "tweak",
    /** Specifies which nodes should be fixed in position when the layout is run. The options are: 'all', 'none', 'adjacent' and 'nonadjacent'. 'fix' only applies to 'standard' and 'tweak' layouts. Default: 'nonadjacent'. */
    fix?: "all" | "none" | "adjacent" | "nonadjacent",
    /** If set to true, each layout run will produce the same chart display for the same chart structure. If false, the layout will produce different results for a given network on each run. Only used for 'standard' and 'lens' layouts. Default: false. */
    consistent?: boolean,
    /** The easing function to use: either 'linear' or 'cubic'. Default: 'cubic'. */
    easing?: "linear" | "cubic",
    /** Fit the chart into the window at the end of the layout. Default: true. */
    fit?: boolean,
    /** If true, the hierarchy will be flattened by removing extra space between levels. Default: false. */
    flatten?: boolean,
    /** The name of the custom property that defines which level a node belongs to in the 'hierarchy' and 'radial' layouts. Custom properties are set on the 'd' property of nodes. The levels on the nodes must be numbers.
    The lowest number represents the level at the top of the hierarchy. Required for the 'hierarchy' and 'radial' layouts, unless the top option is specified. If both 'level' and 'top' are specified, 'top' is ignored. */
    level?: string,
    /** The orientation of the hierarchy layout. There are four available orientations: 'down', 'right', 'up', 'left'. Default: 'down'. */
    orientation?: "down" | "right" | "up" | "left",
    /** If true, curved links are straightened. If false, they remain curved. Default: true. */
    straighten?: boolean,
    /** The tidy option pushes apart the components of the chart so they don't overlap. Not used for 'lens'. Default: true. */
    tidy?: boolean,
    /** A number (0 -> 10) which controls how close the nodes should be. Higher values make the nodes closer. Default: 5. */
    tightness?: number,
    /** An array of node ids which should be at the top of the hierarchy/centre of the radial layout.
    Required for the 'hierarchy' and 'radial' layouts, unless the level option is specified. If both 'level' and 'top' are specified, 'top' is ignored. */
    top?: Array<string>
  }

  interface ExpandFilter {
    /** A function which takes an item as its argument, returning true if the item should be visible, false otherwise. */
    filterFn?: Function,
    /** If true, the filter rules that decide what data to show or hide will apply to the individual items inside the combo. The combo will be hidden if all of its contents are. If false, filtering rules will apply to the combo itself. Default: false. */
    combos?: boolean,
    /** Whether isolated nodes should be hidden, even if the filter function returns true for them. The default is true if type is 'link', false otherwise. */
    hideSingletons?: boolean,
    /** The type of item to show or hide - either 'node', 'link' or 'all'. Default: 'all'. */
    type?: "node" | "link" | "all",
    /** If combos is true, update the text of the NE glyph on combo nodes to equal the number of nodes that are visible inside the combo node. Default: true. */
    updateGlyph?: boolean
  }

  interface ExpandOptions {
    /** Whether the result should be animated. Default: true. */
    animate?: boolean,
    /** The time the animation should take, in milliseconds. Default: 1000. */
    time?: number,
    /**  An object specifying the layout to apply to the incoming items. */
    layout?: ExpandLayoutOptions,
    /** An object with the filter definition to apply to the chart items before running the layout. This object can have any option passed to the chart.filter() function (apart from animate and time) plus an additional one: filterFn. */
    filter?: ExpandFilter
  }

  interface ComboNodeFilterResult {
    /** The id of the combo that has been updated */
    id: string,
    /** The visible node items inside of this combo */
    nodes?: Array<Node>,
    /** The visible link items inside of this combo */
    links?: Array<Link>
  }

  interface ComboLinkFilterResult {
    /** The id of the combo that has been updated */
    id: string,
    /** The visible link items inside of this combo */
    links?: Array<Link>
  }

  interface FilterResult {
    /** The items that were shown by the filter function. */
    shown?: {
      /** The array of node ids shown by the filter function. */
      nodes?: Array<string>,
      /** The array of link ids shown by the filter function. */
      links?: Array<string>
    }
    /** The items that were hidden by the filter function. */
    hidden?: {
      /** The array of node ids hidden by the filter function. */
      nodes?: Array<string>,
      /** The array of link ids hidden by the filter function */
      links?: Array<string>
    }
    /** List the combos that have been updated */
    combos?: {
      /** An array of combo nodes that have been updated by this filter */
      nodes?: Array<ComboNodeFilterResult>,
      /** An array of combo links that have been updated by this filter */
      links?: Array<ComboLinkFilterResult>
    }
  }

  interface FilterOptions {
    /** Whether the filtering operation should be animated. Default: true. */
    animate?: boolean,
    /** Whether isolated nodes should be hidden, even if the filter function returns true for them. The default is true if type is 'link', false otherwise. Default: true. */
    hideSingletons?: boolean,
    /** The time the animation should take, in milliseconds. Default: 1000. */
    time?: number,
    /** The type of item to show or hide. Either 'node', 'link' or 'all'. Default: 'all'. */
    type?: "node" | "link" | "all",
    /** If true, the filter rules that decide what data to show or hide will apply to the individual items inside the combo. The combo will be hidden if all  of its contents are. If false, filtering rules will apply to the combo itself. Default: false. */
    combos?: boolean,
    /** If combos is true, update the text of the NE glyph on combo nodes to equal the number of nodes that are visible inside the combo node. Default: true. */
    updateGlyph?: boolean
  }

  interface ForegroundResult {
    /** The items that were foregrounded by the foreground function. */
    foreground?: {
      /** The array of node ids foregrounded by the foreground function. */
      nodes?: Array<string>,
      /** The array of link ids foregrounded by the foreground function. */
      links?: Array<string>
    }
    /** The items that were backgrounded by the foreground function. */
    background?: {
      /** The array of node ids backgrounded by the foreground function. */
      nodes?: Array<string>,
      /** The array of link ids backgrounded by the foreground function */
      links?: Array<string>
    }
  }

  interface ForegroundOptions {
    /** The type of item to foreground/background - either 'node', 'link' or 'all'. Default: 'node'. */
    type?: "node" | "link" | "all",
    /** Pass the contents of the combo rather than the combo itself.  The combo will be in the background if  all of its contents are. Default: false. */
    combos?: boolean
  }

  interface HideOptions {
    /** Whether the transition should be animated. Default: false. */
    animate?: boolean,
    /** The time the animation should take, in milliseconds. Default: 1000. */
    time?: number
  }

  interface LabelPosition {
    /** Left */
    x1: number,
    /** Right */
    x2: number,
    /** Top */
    y1: number,
    /** Bottom */
    y2: number
  }

  interface LayoutOptions {
    /** Whether the result should be animated. Default: true. */
    animate?: boolean,
    /** If set to true, each layout run will produce the same chart display for the same chart structure. If false, the layout will produce different results for a given network on each run. Only used for 'standard', 'structural' and 'lens' layouts. Default: false. */
    consistent?: boolean,
    /** The easing function to use: either 'linear' or 'cubic'. Default: 'cubic'. */
    easing?: "linear" | "cubic",
    /** Fit the chart into the window at the end of the layout. Default: true. */
    fit?: boolean,
    /** An array of node ids which should be fixed. */
    fixed?: Array<string>,
    /** If true, the hierarchy will be flattened by removing extra space between levels. Default: false. */
    flatten?: boolean,
    /** the name of the custom property that defines which level a node belongs to in the 'hierarchy' and 'radial' layouts. Custom properties are set on the 'd' property of nodes. The levels on the nodes must be numbers.
    The lowest number represents the level at the top of the hierarchy. Required for the 'hierarchy' and 'radial' layouts, unless the top option is specified. If both 'level' and 'top' are specified, 'top' is ignored. */
    level?: string,
    /** The orientation of the hierarchy layout.  There are four orientations available: 'up', 'down', 'left' and 'right'. Default: 'down'. */
    orientation?: "down" | "right" | "up" | "left",
    /** If true, curved links are straightened. If false, they remain curved. Default: true. */
    straighten?: boolean,
    /** The tidy option pushes apart the components of the chart so they don't overlap. Not used for 'lens'. Default: true. */
    tidy?: boolean,
    /** A number (0 -> 10) which controls how close the nodes should be. Higher values make the nodes closer. Default: 5. */
    tightness?: number,
    /** If animated, the time the animation should take, in milliseconds. Default: 700. */
    time?: number,
    /** An array of node ids which should be at the top of the hierarchy/centre of the radial layout.
    Required for the 'hierarchy' and 'radial' layouts, unless the level option is specified. If both 'level' and 'top' are specified, 'top' is ignored. */
    top?: Array<string>
  }

  interface LockOptions {
    /** Use if you would like a wait cursor shown while the chart is locked. */
    wait?: boolean
  }

  interface Band {
    /** The colour of the band. Default: light grey. */
    c?: string,
    /** Whether the band label should be displayed in bold font. Default: false. */
    fb?: boolean,
    /** The colour for the band label font. Default: light grey. */
    fc?: string,
    /** The font family to use for the band label. Default: fontFamily setting. */
    ff?: string,
    /** The font size (pt) of the band label. The band label font size may be reduced if necessary to fit the label in the band. Default: 20. */
    fs?: number,
    /** The text of the band label. */
    t?: string,
    /** The width of the band, in world coordinates. Default: 100. */
    w?: number,
    /** The position of the centre of the band along the X-axis, in world coordinates. Default: 0. */
    x?: number
  }

  interface ImageAlignmentOptions {
    /** Sets how far to move the icon horizontally. The value is a percentage from -50 to 50. Default: 0. */
    dx?: number,
    /** Sets how far to move the icon vertically. The value is a percentage from -50 to 50. Default: 0. */
    dy?: number,
    /** The factor by which you want to resize the icon relative to its parent. The value must be greater than 0. Default: 0. */
    e?: number
  }

  interface LinkEnds {
    /** Whether link ends should avoid node labels. Default: true. */
    avoidLabels?: boolean,
    /** Controls the spacing between link ends and nodes. Possible vaues are:'loose' - there is a small gap between the link end and and the node.'tight' - there is no gap between the link end and the node.. Default: 'tight'. */
    spacing?: "loose" | "tight"
  }

  interface Bands {
    /** An array of objects defining each of the bands. */
    bands?: Array<Band>,
    /** Whether labels are displayed at the bottom of the bands. Default: false. */
    bottom?: boolean,
    /** Whether labels are displayed at the top of the bands. Default: true. */
    top?: boolean
  }

  interface Logo {
    /** The position of the logo. Four positions are supported - 'ne', 'se', 'sw' and 'nw'. Default: 'ne'. */
    p?: string,
    /** The URL of the logo to be displayed, or null for no logo. On Retina devices, KeyLines will also check for a double-resolution @2x version of the logo, e.g. 'path/to/images/myAwesomeLogo@2x.png' */
    u?: string,
    /** The horizontal offset in pixels from the logo's default position. Default: 0. */
    x?: number,
    /** The vertical offset in pixels from the logo's default position. Default: 0. */
    y?: number
  }

  interface NavigationOptions {
    /** The position of the navigation controls. Four positions are supported - 'ne', 'se', 'sw' and 'nw'. Default: 'nw'. */
    p?: "ne" | "nw" | "se" | "sw",
    /** Whether the navigation controls are displayed. Default: true. */
    shown?: boolean,
    /** The horizontal offset in pixels from the navigation controls' default position. Default: 0. */
    x?: number,
    /** The vertical offset in pixels from the navigation controls' default position. Default: 0. */
    y?: number
  }

  interface OverviewOptions {
    /** Whether the icon the user can click on to open/close the overview is shown. Default: true. */
    icon?: boolean,
    /** The position of the overview window. Four positions are supported - 'ne', 'se', 'sw' and 'nw'. Default: 'se'. */
    p?: string,
    /** Whether the overview window is actually shown. Default: false. */
    shown?: boolean,
    /** The size of the overview window in pixels. Default: 100. */
    size?: number
  }

  interface SelectedLinkOptions {
    /** The distance to back-off from end id1 as a ratio of the total length of the link line. Value in the range 0 to 1. */
    b1?: number,
    /** The distance to back-off from end id2 as a ratio of the total length of the link line. Value in the range 0 to 1. */
    b2?: number,
    /** The colour of the link line itself. */
    c?: string,
    /** Whether the label should be displayed in bold font. */
    fb?: boolean,
    /** The background colour of the font. The default is a subtle effect using white with an alpha channel. */
    fbc?: string,
    /** The colour for the label font. */
    fc?: string,
    /** The font family to use for the label. */
    ff?: string,
    /** The font size (pt) of the link label. */
    fs?: number,
    /** The style of the link line. This can be either 'solid', 'dashed' or 'dotted'. This feature is supported only by newer HTML5 browser versions. */
    ls?: "solid" | "dashed" | "dotted",
    /** The width of the link line. */
    w?: number
  }

  interface SelectedNodeOptions {
    /** The border colour. */
    b?: string,
    /** The style of the border line. This can be either 'solid' or 'dashed'. This feature is supported only by newer HTML5 browser versions. */
    bs?: "solid" | "dashed",
    /** The width of the node's border. */
    bw?: number,
    /** The fill colour. */
    c?: string,
    /** The enlargement factor for the node. */
    e?: number,
    /** Whether the label should be displayed in bold font. */
    fb?: boolean,
    /** The background colour of the font. The default is a subtle effect using white with an alpha channel. */
    fbc?: string,
    /** The colour for the label font. */
    fc?: string,
    /** The font family to use for the label. */
    ff?: string,
    /** The font size (pt) of the node label. */
    fs?: number,
    /** A halo object. */
    ha0?: Halo,
    /** A halo object. */
    ha1?: Halo,
    /** A halo object. */
    ha2?: Halo,
    /** A halo object. */
    ha3?: Halo,
    /** A halo object. */
    ha4?: Halo,
    /** A halo object. */
    ha5?: Halo,
    /** A halo object. */
    ha6?: Halo,
    /** A halo object. */
    ha7?: Halo,
    /** A halo object. */
    ha8?: Halo,
    /** A halo object. */
    ha9?: Halo,
    /** Whether resize handles should be shown. */
    re?: boolean,
    /** The URL of the node image. */
    u?: string
  }

  interface TruncateLabelsOptions {
    /** The maximum length labels can be before they are truncated, in characters. The labels are truncated to the length specified, the last three characters of the string are replaced with an 'ellipsis' - three dots (...). Default: 30. */
    maxLength?: number,
    /** Controls whether the full label is displayed on hover. You can change the hover interval using the hover option. Not supported on touch devices. Default: true. */
    shownOnHover?: boolean
  }

  interface WatermarkOptions {
    /** The vertical alignment of the watermark text. 'top', 'bottom' or 'centre'. Default: 'centre'. */
    a?: "top" | "bottom" | "centre",
    /** Whether the watermark is to be shown in bold. Default: false. */
    fb?: boolean,
    /** The background colour for the watermark text. */
    fbc?: string,
    /** The colour of the watermark text. */
    fc?: string,
    /** The font family to use. If not specified uses fontFamily above. */
    ff?: string,
    /** The watermark's font size (pt). */
    fs?: number,
    /** The text of the watermark. */
    t?: string,
    /** The URL of the watermark if an image is to be shown. */
    u?: string
  }

  interface Gradient {
    /** Defines the gradient colours as an array. */
    stops?: Array<GradientColour>
  }

  interface GradientColour {
    /** The r (ratio) values are the proportion from top to bottom. */
    r?: number,
    /** The c is the colour setting for that stop. */
    c?: string
  }

  interface ChartOptions {
    /** Controls the appearance of arrows on links. Possible values are 'normal' and 'small'. Default: 'normal'. */
    arrows?: "normal" | "small",
    /** The rgb colour to use for the background of the chart itself. */
    backColour?: string,
    /** The alpha value to apply to background items, in the range 0 to 1. */
    backgroundAlpha?: number,
    /** Set to give the chart a set of labelled vertical background bands. options.bands = { top: true, bottom: true, bands: [{x: 100, w: 100, c: '#F0F0F0', t: 'Band 1'}, {x: 200, w: 100, c: '#F8F8F8', t: 'Band 2'}]}; */
    bands?: Bands,
    /** The rgb colour to use for the navigation and overview window controls.
    Only the hue and saturation of the colour are used: the lightness is fixed. Note: The overview window is not supported in WebGL mode. */
    controlColour?: string,
    /** If true, drag operations will pan the chart automatically
    if the mouse or touch position moves near the edge of or outside the chart area.
    If false, the chart will not pan if the mouse or touch position moves near the
    edge of the chart area during a drag operation, and the drag will be cancelled
    if the mouse moves outside the chart area. Default: true. */
    dragPan?: boolean,
    /** The length of the 'fan' part of links drawn with horizontal style. */
    fanLength?: number,
    /** The default font family to use, for example 'sans-serif' or 'helvetica'.
    If you don’t set a font family, 'sans-serif' is used.
    If you set multiple font families, only the first one supported by the browser is used. Default: 'sans-serif'. */
    fontFamily?: string,
    /** Set to give the chart a background gradient fill. The gradient fill runs from top to bottom of the chart. */
    gradient?: Gradient,
    /** If true, dragging the chart background drags all items.
    If false, dragging the chart background draws a bounding box for selecting items. Default: false. */
    handMode?: boolean,
    /** The number of milliseconds delay before the hover event is triggered. Default: 1000. */
    hover?: number,
    /** The default font family to use for font icons, for example 'FontAwesome' or 'Octicons'.
    If not set, the font family 'sans-serif' is used.
    If you set multiple font families, only the first one supported by the browser is used. Default: 'sans-serif'. */
    iconFontFamily?: string,
    /** For each image path or font icon, set the position and scale.
    The imageAlignment should contain a property with the path of the image or the font icon which is to be adjusted. */
    imageAlignment?: IdMap<ImageAlignmentOptions>,
    /** An integer to move the label text up or down. Useful only for certain fonts where the baseline is irregular (e.g. Open Sans). */
    labelOffset?: number,
    /** Contains settings that control how the ends of links are drawn. */
    linkEnds?: LinkEnds,
    /** Settings for the logo to be displayed in a corner of the chart. */
    logo?: Logo,
    /** Controls how links are selected when dragging a selection marquee. Possible values are: 'centre', 'ends' or 'off'. Default: 'centre'. */
    marqueeLinkSelection?: "centre" | "ends" | "off",
    /** Sets the maximum zoom for items, from minZoom to 4. We suggest a value of around 1 to have an optimal result. */
    maxItemZoom?: number,
    /** Sets the minimum zoom for the view.
    Use a smaller value to allow the chart to be zoomed out further.
    The value can be from 0.01 to 1. Default: 0.05. */
    minZoom?: number,
    /** An object whose properties are the settings for the navigation controls. */
    navigation?: NavigationOptions,
    /** An object whose properties are the settings for the overview window.Note: The overview window is not supported in WebGL mode. */
    overview?: OverviewOptions,
    /** Specifies how to draw selected links. If present, its value is an object whose
    properties override the properties of selected links when they are drawn. If null or undefined, selected links are drawn in a default way. */
    selectedLink?: SelectedLinkOptions,
    /** Specifies how to draw selected nodes. If present, its value is an object whose
    properties override the properties of selected nodes when they are drawn. If null or undefined, selected nodes are drawn in a default way. */
    selectedNode?: SelectedNodeOptions,
    /** The rgb colour to use for selected items on the chart that are drawn in the default way. */
    selectionColour?: string,
    /** The rgb colour to use for the font of selected items on the chart that are drawn in the default way. */
    selectionFontColour?: string,
    /** If true, links from a node to itself can be added to the chart. If false, such links are ignored. Default: false. */
    selfLinks?: boolean,
    /** If specified, an object whose properties control how item labels are truncated. If not specified, item labels are not truncated. */
    truncateLabels?: TruncateLabelsOptions,
    /** An object whose properties are the settings for the watermark in the centre of the chart. */
    watermark?: WatermarkOptions
  }

  interface PanOptions {
    /** Whether the transition should be animated. Default: false. */
    animate?: boolean,
    /** The length of the animation in milliseconds. Default: 1000. */
    time?: number
  }

  interface PingOptions {
    /** The rgb colour to use for the halo. Default: 'mid-grey'. */
    c?: string,
    /** The radius of the halo at the end of the animation. Default: 80. */
    r?: number,
    /** The number of times the animation should be repeated. Default: 1. */
    repeat?: number,
    /** The time the animation should take, in milliseconds. Default: 800. */
    time?: number,
    /** The width of the halo at the end of the animation. Default: 20. */
    w?: number
  }

  interface ShowOptions {
    /** Whether the transition should be animated. Default: false. */
    animate?: boolean,
    /** The length of the animation in milliseconds. Default: 1000. */
    time?: number
  }

  interface ToDataURLOptions {
    /** How the current view settings are mapped when generating the image.  This can be one of four values: 'exact', 'view', 'chart' or 'oneToOne'. Default: 'view'. */
    fit?: "exact" | "view" | "chart" | "oneToOne",
    /** Whether the chart background gradient (if any) should be drawn. Default: true. */
    gradient?: boolean,
    /** Whether the logo (if any) should be drawn. Default: true. */
    logo?: boolean,
    /** If noScale is true, the image is drawn as if it were a new component at 1-1 scale.
     This means that any logo or watermark will be drawn at 1-1 in the image. If false, the logo and watermark are sized to fit the image size. Default: false. */
    noScale?: boolean,
    /** Whether the current selection (if any) should be drawn selected in the image. Default: false. */
    selection?: boolean,
    /** Whether the watermark (if any) should be drawn. Default: true. */
    watermark?: boolean
  }

  interface Transition {
    /** Whether the transition should be animated. Default: false. */
    animate?: boolean,
    /**  The time the animation should take, in milliseconds. Default: 1000. */
    time?: number
  }

  interface ViewOptions {
    /** The level of zoom. 1 is 1-to-1. */
    zoom?: number,
    /** The view offset in the X direction measured in pixels. Default: 0. */
    offsetX?: number,
    /** The view offset in the Y direction measured in pixels. Default: 0. */
    offsetY?: number,
    /** The height of the view (read only). */
    height?: number,
    /** The width of the view (read only). */
    width?: number
  }

  interface Coordinates {
    /** The x coordinate */
    x: number,
    /** The y coordinate */
    y: number
  }

  interface ZoomOptions {
    /** Whether the transition should be animated. Default: false. */
    animate?: boolean,
    /** The length of the animation in milliseconds. Default: 1000. */
    time?: number
  }

  interface ComboDefinition {
    /** If defined, all properties will be transfered to the new combo's d property. */
    d?: any,
    /** An x offset for positions of members of the combo if it is later uncombined. Default: 0. */
    dx?: number,
    /** A y offset for positions of members of the combo if it is later uncombined. Default: 0. */
    dy?: number,
    /** An array of id strings of nodes to combine. This is the only mandatory property and can contain one or more node ids. */
    ids: string | Array<string>,
    /** The style of glyph to create. The default is red in the top right corner showing the number of nodes contained within the combo. Set to null for no Glyph. You can add more glyphs using "style.g". */
    glyph?: Glyph,
    /** The label to use for the combo. If not specified, the label will be composed of the labels of the nodes in the order of the ids array. */
    label?: string,
    /** The style of the combo node using the standard node property names. If not specified, the style will be the same as the first node in the ids array. If style.hi is not specified, the combo will be visible if any of its member nodes are visible. */
    style?: NodeStyle,
    /** The position of the final combo: 'average' or 'first'. Default: 'average'. */
    position?: "average" | "first"
  }

  interface CombineOptions {
    /** Whether the combination(s) should be animated. Default: true. */
    animate?: boolean,
    /** Whether the resulting combo(s) should be selected. Default: true. */
    select?: boolean,
    /** If animated, the time the animation should take, in milliseconds. Default: 250. */
    time?: number
  }

  interface IsComboOptions {
    /** Specifies which types of item are tested: either 'all', 'node', or 'link'. Default: 'all'. */
    type?: "node" | "link" | "all"
  }

  interface UncombineOptions {
    /** Whether the operation should be animated. Default: true. */
    animate?: boolean,
    /** Whether all nodes within the combo should be shown. If false, just the first level of the combo is shown again. Default: false. */
    full?: boolean,
    /** Whether the resulting nodes should be selected. Default: true. */
    select?: boolean,
    /** If animated, the time the animation should take, in milliseconds. Default: 250. */
    time?: number
  }

  interface MapOptions {
    /** Whether showing and hiding the map should be animated. Default: true. */
    animate?: boolean,
    /** A string specifying the url template for map tiles, in the form 'http://example.com/path/{z}/{x}/{y}.png', or an object in the Leaflet TileLayer options format, with an additional 'url' property specifying the url template. */
    tiles?: any | string,
    /** If animated, the time that showing or hiding the map should take, in milliseconds. Default: 800. */
    time?: number,
    /** Controls how items are positioned when transitioning from map mode to network mode. Use 'restore' to move items back to their previous positions, or 'layout' to position using a 'standard' layout. Default: 'restore'. */
    transition?: 'restore' | 'layout'
  }

  interface BetweennessOptions {
    /** Whether the betweenness computation should consider the direction of links. Default: false. */
    directed?: boolean,
    /** This defines if the betweenness measure should be normalized by component,
    by chart or not normalized. Values are - 'unnormalized', 'chart' and 'component'. . Default: 'component'. */
    normalization?: "unnormalized" | "chart" | "component",
    /** The name of the custom property which defines each link's length.  Custom properties mean properties set on the 'd' property of the links. */
    value?: string,
    /** If true, the path length of any link is the reciprocal of the value ( 1 / value ). Default: false. */
    weights?: boolean,
    /** This option lets the function iterate on all nodes and links in the chart when true, hidden ones included. Default: false. */
    all?: boolean
  }

  interface ClosenessOptions {
    /** 'from', 'to', or 'any'. 'from' only includes links in the direction of arrows, 'to' only includes links against the direction of arrows, and 'any' includes any link regardless of arrows. Note that to use 'from' or 'to', your graph must have arrows on links. Default: 'any'. */
    direction?: "from" | "to" | "any",
    /** This defines if the closeness measure should be normalized by component or by chart. Allowed values are 'chart' or 'component'. Default: 'component'. */
    normalization?: "chart" | "component",
    /** The name of the custom property which defines each link's value.  Custom properties mean properties set on the 'd' property of the links. */
    value?: string,
    /** This option means that the path length of any link is the reciprocal of the value, i.e. ( 1 / value ). Default: false. */
    weights?: boolean,
    /** This option lets the function iterate on all nodes and links in the chart when true, hidden ones included. Default: false. */
    all?: boolean
  }

  interface ClustersOptions {
    /** The name of a custom property which defines each link's value. Custom properties mean properties set on the 'd' property of the links. Higher valued links tend to cluster their nodes more closely. */
    value?: string,
    /** A number from 0 to 10 that affects cluster size. Higher values give smaller clusters, but more of them; lower values give larger clusters, but not as many. Default: 5. */
    factor?: number,
    /** Set to true to see the same result every time you run a cluster, or false if you want to see different results. Default: true. */
    consistent?: boolean,
    /** This option lets the function iterate on all nodes and links in the chart when true, hidden ones included. Default: false. */
    all?: boolean
  }

  interface ComponentsResult {
    /** Array of node ids in this component */
    nodes: Array<string>,
    /** Array of link ids in this component */
    links?: Array<string>
  }

  interface ComponentsOptions {
    /** This option lets the function iterate on all nodes and links in the chart when true, hidden ones included. Default: false. */
    all?: boolean
  }

  interface DegreesOptions {
    /** 'from', 'to', or 'any'. 'from' counts only links with arrows pointing away from nodes (out-degree), 'to' counts only links with arrows pointing to nodes (in-degree), and 'any' counts all links regardless of whether they have arrows. Note that to use 'from' or 'to', your graph must have arrows on links. Default: 'any'. */
    direction?: "from" | "to" | "any",
    /** The name of the custom property which defines each link's value.  Custom properties mean properties set on the 'd' property of the links. */
    value?: string,
    /** This option means that the path length of any link is the reciprocal of the value, i.e. ( 1 / value ). Default: false. */
    weights?: boolean,
    /** This option lets the function iterate on all nodes and links in the chart when true, hidden ones included. Default: false. */
    all?: boolean
  }

  interface DistancesOptions {
    /** 'from', 'to', or 'any'. 'from' only includes links in the direction of arrows, 'to' only includes links against the direction of arrows, and 'any' includes any link regardless of arrows. Note that to use 'from' or 'to', your graph must have arrows on links. Default: 'any'. */
    direction?: "from" | "to" | "any",
    /** The name of the custom property which defines the distance value of a link.  Custom properties mean properties set on the 'd' property of the links. */
    value?: string,
    /** This option means that the path length of any link is the reciprocal of the value, i.e. ( 1 / value ). Default: false. */
    weights?: boolean,
    /** This option lets the function iterate on all nodes and links in the chart when true, hidden ones included. Default: false. */
    all?: boolean
  }

  interface EigenCentralityOptions {
    /** The name of the custom property which defines the value of a link.  Custom properties mean properties set on the 'd' property of the links. If not set, all links have value 1. */
    value?: string,
    /** This option lets the function iterate on all nodes and links in the chart when true, hidden ones included. Default: false. */
    all?: boolean
  }

  interface KCoresResult {
    /** The maximum k in the graph. */
    maximumK?: number,
    /** A dictionary of all nodes, each one with its k value. */
    values?: IdMap<number>
  }

  interface KCoresOptions {
    /** This option lets the function iterate on all nodes and links in the chart when true, hidden ones included. Default: false. */
    all?: boolean
  }

  interface NeighboursResult {
    /** Array of neighbouring node ids */
    nodes: Array<string>,
    /** Array of neighbouring link ids */
    links?: Array<string>
  }

  interface NeighboursOptions {
    /** This option lets the function iterate on all nodes and links in the chart when true, hidden ones included. Default: false. */
    all?: boolean,
    /** 'from', 'to', or 'any'. 'from' only finds neighbours in the direction of arrows, 'to' only finds neighbours against the direction of arrows, and 'any' finds neighbours on any link regardless of arrows. Note that to use 'from' or 'to', your graph must have arrows on links. Default: 'any'. */
    direction?: "from" | "to" | "any",
    /** This defines how far away neighbours can be from the passed ids. Default: 1. */
    hops?: number
  }

  interface PageRankOptions {
    /** The name of the custom property which defines the value of a link.  Custom properties mean properties set on the 'd' property of the links. If not set, all links have value 1. */
    value?: string,
    /** If false, all the links are treated as undirected for the PageRank computation. Default: true. */
    directed?: boolean,
    /** This option lets the function iterate on all nodes and links in the chart when true, hidden ones included. Default: false. */
    all?: boolean
  }

  interface ShortestPathsResult {
    /** One of the shortest paths found - returned as an array of alternating node and link ids, including the start and end nodes */
    onePath: Array<string>,
    /** An array describing the same path as onePath, but containing node ids only, including the start and end nodes */
    one: Array<string>,
    /** An array of all node and link ids that are on all the shortest paths, including the start and end nodes  */
    items: Array<string>,
    /** The length of the shortest path - more precisely the combined link value of the path */
    distance: number
  }

  interface ShortestPathsOptions {
    /** 'from', 'to', or 'any'. 'from' only traverses links in the direction of arrows, 'to' only traverses links against the direction of arrows, and 'any' can traverse any link regardless of arrows. Note that to use 'from' or 'to', your graph must have arrows on links. Default: 'any'. */
    direction?: "from" | "to" | "any",
    /** The name of the custom property which defines the value of a link.  Custom properties mean properties set on the 'd' property of the links. */
    value?: string,
    /** This option means that the path length of any link is the reciprocal of the value, i.e. ( 1 / value ). Default: false. */
    weights?: boolean,
    /** This option lets the function iterate on all nodes and links in the chart when true, hidden ones included. Default: false. */
    all?: boolean
  }

  interface Component {
    /** The id of the HTML element to replace with the component. */
    id: string,
    /** The type of component to create, either 'chart' or 'timebar'. The default is 'chart'. */
    type?: "chart" | "timebar",
    /** Chart or Time Bar options for the new component (optional). */
    options?: ChartOptions | TimeBarOptions,
  }

  interface GraphEngineOptions {
    /** If true, links from a node to itself can be loaded into the graph engine. If false, such links are ignored. Default: false. */
    selfLinks?: boolean
  }

  interface PathsOptions {
    /** The path to the KeyLines assets folder on your servers. */
    assets?: string,
    /** The path to use for images (optional). */
    images?: string
  }

  interface DragControlOptions {
    /**  whether dragging is allowed in the x-direction. Default: true. */
    x?: boolean,
    /** whether dragging is allowed in the y-direction. Default: true. */
    y?: boolean,
    /** tan array of ids of items that will also be dragged, even if they are not selected. Applies to the 'move' dragger only. */
    add?: Array<string>
  }

  interface Locale {
    /** An array of two strings giving the text to use for AM and PM when displaying 12-hour clock times. Optionally this array may contain two more strings, which are used to label time bar intervals representing the first and second halves of days. Default: ['AM', 'PM']. */
    ampm?: Array<string>,
    /** A flag indicating whether the 12-hour clock should be used to display times. If false, the 24-hour clock is used. Default: true. */
    h12?: boolean,
    /** A prefix used to indicate halves of years. Default: 'H'. */
    half?: string,
    /** An array of strings giving the full names of the months, starting with January. Default: ['January', etc]. */
    longMonths?: Array<string>,
    /** A string controlling the order of dates. Supported values are 'dmy' for day-month-year, and 'mdy' for month-day-year. Default: 'mdy'. */
    order?: string,
    /** A prefix used to indicate quarters of years. Default: 'Q'. */
    quarter?: string,
    /** An array of strings giving abbreviated names of the months, starting with January. Default: ['Jan', etc]. */
    shortMonths?: Array<string>
  }

  interface HeightChange {
    /** Whether height changes should be animated. Default: true. */
    animate?: boolean,
    /** If animated, the time the animation should take, in milliseconds. Default: 200. */
    time?: number
  }

  interface Histogram {
    /** The colour of the histogram bars. Default: light grey. */
    colour?: string,
    /** the colour of the histogram bars when they are hovered over. Default: grey. */
    highlightColour?: string
  }

  interface MinScale {
    /** The number of the specified units. Default: 1. */
    value?: number,
    /** The unit of the minimum scale level. The supported units are: 'year', 'month', 'week', 'day', 'hour', 'min' and 'sec'. Default: 'sec'. */
    units?: string
  }

  interface Scale {
    /** The colour of the time scale section that is hovered over. Default: light grey. */
    highlightColour?: string,
    /** Whether the major time scale (the lower scale) is shown. Default: true. */
    showMajor?: boolean,
    /** Whether the minor time scale (the higher scale) is shown. Default: true. */
    showMinor?: boolean
  }

  interface TimeBarOptions {
    /** The colour to set the background of the time bar. Default: 'white'. */
    backColour?: string,
    /** The colour to set the font of the time bar (used in the scales). Default: grey. */
    fontColour?: string,
    /** The font family to use, for example, 'sans-serif'. If you don’t set a font family, 'sans-serif' is used. If you set multiple font families, only the first one supported by the browser is used. */
    fontFamily?: string,
    /** The font size to use. There is no size limit, but most fonts look better if you use a value between 7 and 13. Default: 12. */
    fontSize?: number,
    /** Options controlling animation of height changes for histogram bars and selection lines. */
    heightChange?: HeightChange,
    /** Options for the histogram bars. */
    histogram?: Histogram,
    /** Specifies how dates and times are displayed. */
    locale?: Locale,
    /** Specifies the time interval at the time bar's minimum scale level, for example with a minScale fixed to { units: 'hour', value: 6 } the time bar will not zoom in beyond six-hour intervals. This can be useful when the data has no precise information about the hour or the minute of the event to stop zooming further. */
    minScale?: MinScale,
    /** The speed that the time bar moves at when playing, in pixels per second.
    May be negative to animate backwards in time in 'normal' mode, or to animate the right hand slider moving backwards in time in 'extend' mode. Default: 60. */
    playSpeed?: number,
    /** Options for the minor and major time scales. */
    scale?: Scale,
    /** Whether the control bar at the base of the time bar is shown. Default: true. */
    showControlBar?: boolean,
    /** Whether the extend button is displayed. Default: false. */
    showExtend?: boolean,
    /** Whether the play button is displayed. Default: true. */
    showPlay?: boolean,
    /** The colour to set the slider. The default is white with an opacity of 0.6. */
    sliderColour?: string,
    /** The colour to set the bars at the inner edge of the slider. Default: grey. */
    sliderLineColour?: string,
    /** Specifies slider behaviour. Options are 'fixed', 'free' or 'none'. Default: 'fixed'. */
    sliders?: "fixed" | "free" | "none"
  }

  interface TimeBarPanOptions {
    /** Whether the transition should be animated. Default: true. */
    animate?: boolean,
    /** The length of the animation in milliseconds. Default: 200. */
    time?: number
  }

  interface TimeBarPlayOptions {
    /** If true, the start of the range stays fixed and the end is extended. Default: false. */
    extend?: boolean
  }

  interface TimeBarRangeResult {
    /** The start time for the time range of the time bar, as a Date object */
    dt1: Date,
    /** The end time for the time range of the time bar, as a Date object */
    dt2: Date
  }

  interface TimeBarRangeOptions {
    /** Whether the transition should be animated. Default: true. */
    animate?: boolean,
    /** The length of the animation in milliseconds. Default: 200. */
    time?: number
  }

  interface SelectionOptions {
    /** An id or a list of ids to select. */
    id?: string | Array<string>,
    /** The index for the selection line. This field can be omitted when a single selection is passed. */
    index?: number,
    /** The colour for the selection line. */
    c?: string
  }

  interface TimeBarZoomOptions {
    /** Whether the transition should be animated. Default: true. */
    animate?: boolean,
    /** For 'fit' only: the id string or array of id strings of items to include in the fit range. If not specified, all items are included. */
    id?: string | Array<string>,
    /** The length of the animation in milliseconds. Default: 200. */
    time?: number
  }

  interface Chart {
    /** animateProperties allows custom animations to be made and chained together.
    * @param items An array of items whose properties are to be changed, or an object if just one item is changing.
    * @param options Options to control the animation.*/
    animateProperties(items: NodeProperties | LinkProperties | ShapeProperties | Array<NodeProperties | LinkProperties | ShapeProperties>, options?: AnimatePropertiesOptions): Promise<void>;

    /**  The arrange function places a set of nodes together in close proximity to each other.
    * @param name The arrangement to use: 'grid', 'circle' or 'radial'.
    * @param items An array of the ids of the nodes to arrange.
    * @param options Various options to control the arrangement of the nodes*/
    arrange(name: "grid" | "circle" | "radial", items: Array<string>, options?: ArrangeOptions): Promise<void>;

    /** Clear removes all items from the chart.*/
    clear(): void;

    /** The combo namespace has methods for combining the nodes and links of a chart to simplify it.*/
    combo(): Combo;

    /** The contains function returns an array of ids of all the nodes contained inside the given shape.
    * @param shape The definition of the shape.
    * @returns The ids of the nodes contained in the shape (if any)*/
    contains(shape: ShapeOptions): Array<string>;

    /** The createLink function allows the user to draw a new link starting from a specified node.
    * @param id The id of the starting node; this node will be the id1 of the new link.
    * @param linkId The id to set on the new link.
    * @param options Various options to control the style of the link.
    * @returns The id of the linked item, or null if the user did not create a link.*/
    createLink(id: string, linkId: string, options?: CreateLinkOptions): Promise<string>;

    /** The each function allows easy iteration over all the items in the chart.  The handler is called with one parameter: the current item.
    * @param options Options controlling how to iterate over the chart items.
    * @param handler The function to be called for each item in the chart.*/
    each(options: EachOptions, handler: Function): void;

    /** The expandMultiple function is the easiest way to add new items to the chart.  It performs a merge followed by a layout.
    * @param items A KeyLines chart object or an array of items to be added.
    * @param options Various options to control the expanding action of the nodes.*/
    expand(items: ChartData | Array<Node | Link | Shape>, options?: ExpandOptions): Promise<void>;

    /** The filter function allows items in the chart to be hidden or shown depending on your own criterion.
    * @param filterFn A function which takes an item as argument. Returns true if the item should be visible, false otherwise.
    * @param options Various options to control the filtering.
    * @returns A Promise.*/
    filter(filterFn: Function, options?: FilterOptions): Promise<FilterResult>;

    /** The foreground function allows items in the chart to be set as background or foreground items depending on your own criterion.
    * @param foregroundFn A function which takes an item as its argument, returning false if the item should be in the background, true otherwise.
    * @param options Various options to control the foreground operation.
    * @returns A Object which contains the nodes and links which are in the foreground and background */
    foreground(foregroundFn: Function, options?: ForegroundOptions): Promise<ForegroundResult>;

    /** Gets items in the chart which match the id.
    * @param id The id string of the item to be retrieved.
    * @returns The item matched. Returns null if there is no item matching an id.*/
    getItem(id: string): Node | Link | Shape;

    /** Gets items in the chart which match the id.
    * @param ids The array of id strings of the items to be retrieved.
    * @returns The items matched. Returns null if there is no item matching an id.*/
    getItem(ids: Array<string>): Array<Node | Link | Shape>;

    /** The graph object has methods for navigating the graph structure (the nodes and links) of a chart.*/
    graph(): Graph;

    /** Hide item or items with the id(s) specified. Pass a single id to hide a single item, or an array of id strings to hide many items at once.
    * @param id The id string or array of id strings of items to hide.
    * @param options Options controlling the hide operation*/
    hide(id: string | Array<string>, options?: HideOptions): Promise<void>;

    /** labelPosition returns information about the label by the item with the id specified.
    * @param id The identity of the item.
    * @returns An object containing label coordinate properties: {x1: (left), x2: (right), y1: (top), y2: (bottom)}*/
    labelPosition(id: string): LabelPosition;

    /** The layout function positions the nodes of the chart.
    * @param name The name of the layout to be invoked. The default is 'standard'.
    * @param options Sets various features of the layout*/
    layout(name?: "standard" | "hierarchy" | "lens" | "radial" | "structural" | "tweak", options?: LayoutOptions): Promise<void>;

    /** Replaces the chart data with the new data specified. Any existing objects in the chart will be dereferenced.
    * @param data The data to load into the chart*/
    load(data: ChartData): Promise<void>;

    /** The chart has a lock state. When locked, no end-user interactions are possible: no mouse, keyboard or touch events will alter the state of the chart.
    * @param val If specified, sets the chart lock state.
    * @param options Use {wait: true} if you would like a wait cursor shown while the chart is locked
    * @returns True if the chart is locked, false otherwise.*/
    lock(val?: boolean, options?: LockOptions): boolean;

    /** The map namespace has methods for displaying the chart on a map.*/
    map(): Map;

    /** The merge function adds new items to the chart. Items will be matched based on their id fields.
    * @param items A KeyLines chart object or an array of items to be added.*/
    merge(items: Node | Link | Shape | ChartData | Array<Node | Link | Shape>): Promise<void>;

    /** The options function sets the current chart display and interaction options.
    * @param ChartOptions Sets the chart options
    * @returns The current options*/
    options(ChartOptions: ChartOptions): Promise<void>;

    /** The options function gets the current chart display and interaction options.*/
    options(): ChartOptions;

    /** Pan the chart in the direction specified
    * @param direction Which direction to pan.
    * @param options Options controlling the pan operation.*/
    pan(direction: "up" | "down" | "left" | "right" | "selection", options?: PanOptions): Promise<void>;

    /** The ping function adds a halo to a specified node, animates it, and then removes it again.
    * @param id The id string or array of id strings of nodes to be animated.
    * @param options Options to control the animation*/
    ping(id: string | Array<string>, options?: PingOptions): Promise<void>;

    /** Remove item or items with the id(s) specified. Pass a single id to remove a single item, or an array of id strings to remove many items at once.
    * @param id The id string or array of id strings of items to remove.*/
    removeItem(id: string | Array<string>): void;

    /** The selection function sets the current chart selection as an array of ids.
    * @param val Sets the chart selection. The array should be ids of the items to select.
    * @returns The current selection as a list of item ids.*/
    selection(val: Array<string>): Array<string>;

    /** The selection function gets the current chart selection as an array of ids.*/
    selection(): Array<string>;

    /** The serialize function returns a complete serialization of the current chart content in the form specified by the object properties section. This can be used for saving the chart state in a database or for implementing features like undo or redo.*/
    serialize(): ChartData;

    /** setItem creates a new item in the chart with the specified properties.
    * @param item The item object to set in the chart
    * @returns A Promise*/
    setItem(item: Node | Link | Shape): Promise<void>;

    /** setProperties is a powerful function for changing the properties of many items at once.
    * @param items An array of items whose properties are to be changed.
    * @param useRegEx Whether the ids are to be treated as regular expression strings. The default is false.*/
    setProperties(items: NodeProperties | LinkProperties | ShapeProperties | Array<NodeProperties | LinkProperties | ShapeProperties>, useRegEx?: boolean): Promise<void>;

    /** Shows (unhides) the items specified by the id parameter
    * @param id The id string or array of id strings of items to show.
    * @param showLinks If true then any hidden links to nodes which will become shown are also shown.
    * @param options Options controlling the show operation.*/
    show(id: string | Array<string>, showLinks?: boolean, options?: ShowOptions): Promise<void>;

    /** This function returns a data URL of the chart image
    * @param width The width of the required image in pixels. The default is 100.
    * @param height The height of the required image in pixels. The default is 100.
    * @param options Various options which control how the image is created
    * @returns A base64 encoded PNG image string*/
    toDataURL(width?: number, height?: number, options?: ToDataURLOptions): Promise<string>;

    /** The unbind function detaches an event handler that was attached to it
    * @param name The name of the event to be detached from, e.g., 'click'. You can also unbind multiple events in a single call, separating each one with a comma or space, e.g. 'click, touchdown'.
    * @param handler The event handler that was supplied to the bind call.*/
    unbind(name?: string, handler?: Function): void;

    /** viewCoordinates is a function for converting world coordinates - positions of items within the chart - to screens coordinates in the current view.  This depends on the current view settings (zoom and pan).  View coordinates are relative to the top left corner or the component.
    * @param x The x position in world coordinates.
    * @param y The y position in world coordinates.
    * @returns An object {x: x, y: y} containing the view coordinates    */
    viewCoordinates(x: number, y: number): Coordinates;

    /** The viewOptions function sets the current chart view options, which covers the zoom setting and viewport location.
    * @param viewOptions Sets the view options
    * @param transition How the transition should be managed
    * @returns The current view options*/
    viewOptions(viewOptions: ViewOptions, transition?: Transition): Promise<void>;

    /** The viewOptions function gets the current chart view options, which covers the zoom setting and viewport location.    */
    viewOptions(): ViewOptions;

    /** worldCoordinates is a function for converting screens coordinates (in the current view) to the coordinates which are used to represent the position of items within the chart. This depends on the current view settings (zoom and pan).
    * @param x The position in screens pixel coordinates relative to the left side of the component.
    * @param y The position in screens pixel coordinates relative to the top of the component.
    * @returns An object {x: x, y: y} containing the world coordinates    */
    worldCoordinates(x: number, y: number): Coordinates;

    /** Zoom the chart in the manner specified.
    * @param how How to zoom the chart: 'in', 'out', 'one', 'fit' (fit chart to window), 'height' (fit chart height to window) or 'selection' (fit selection to window)
    * @param options Options controlling the zoom operation*/
    zoom(how: "in" | "out" | "one" | "fit" | "height" | "selection", options?: ZoomOptions): Promise<void>;

    /** Binding to the all event will capture all events that occur within the KeyLines chart. It is slightly different in structure to other events in that the first argument is the name of the event which was captured. The rest of the arguments depend on the type of event captured. Return true to override the event's default action
    * @param name The name of the event which was captured, e.g. 'click'.*/
    bind(name: 'all', handler: (name?: string) => boolean): void;

    /** The click event is triggered when the end-user clicks on the chart surface. On touch devices this is triggered when the end-user touches the chart.
    * @param id The id of the item that was clicked, or null if the mouse was on the chart background.
    * @param x The x location of the click in view coordinates.
    * @param y The y location of the click in view coordinates.
    * @param button The button used. 0 is logical left button and 1 is middle. To trap the right-click use the context menu event.
    * @param sub The sub-widget clicked, or null if the click is over the main part of the item.*/
    bind(name: 'click', handler: (id?: string, x?: number, y?: number, button?: number, sub?: string) => void): void;

    /** The contextmenu event is triggered when the end-user right-clicks on the chart surface. On touch devices this is triggered when the end-user does a long press on the chart.
    * @param id The id of the item that was right-clicked, or null if the click was on the chart background.
    * @param x The x location of the right-click in view coordinates.
    * @param y The y location of the right-click in view coordinates.
    * @param sub The sub-widget, or null if over the main part of the item.*/
    bind(name: 'contextmenu', handler: (id?: string, x?: number, y?: number, sub?: string) => void): void;

    /** The dblclick event is triggered when the end-user double-clicks on the chart surface. On touch devices this is triggered when the end-user double-taps the chart. Default action: Zoom in (animated) when double-clicking the background. Return true to override this behaviour.
    * @param id The id of the item that was double-clicked, or null if the mouse was on the chart background.
    * @param x The x location of the double-click in view coordinates.
    * @param y The y location of the double-click in view coordinates.
    * @param sub The sub-widget clicked, or null if the click is over the main part of the item.*/
      bind(name: 'dblclick', handler: (id?: string, x?: number, y?: number, sub?: string) => boolean): void;

    /** The delete event is triggered when the user presses the delete key on the keyboard. Default behaviour: remove the item from the chart. Return true to override this behaviour.*/
    bind(name: 'delete', handler: () => boolean): void;

    /** The dragcomplete event is fired after the default behaviour has been performed (if applicable) and everything is finished.
    * @param type The type of the drag: 'move', 'hand', 'area', 'resize', 'offset', 'dummy' are all various types of drag.
    * @param id The id of the item is being dragged, or null if no item is being dragged.
    * @param x The x location of the drag in view coordinates.
    * @param y The y location of the drag in view coordinates.*/
    bind(name: 'dragcomplete', handler: (type?: string, id?: string, x?: number, y?: number) => void): void;

    /** The dragend event is fired just before drags finish. This event is designed to allow you to customise the behaviour of the drag result. Default behaviour: finish the drag action. The precise behaviour depends on the nature of the drag.
    * @param type The type of the drag: 'move', 'hand', 'area', 'resize', 'offset', 'dummy' are all various types of drag.
    * @param id The id of the item is being dragged, or null if no item is being dragged.
    * @param x The x location of the drag in view coordinates.
    * @param y The y location of the drag in view coordinates.*/
    bind(name: 'dragend', handler: (type?: string, id?: string, x?: number, y?: number) => boolean): void;

    /** The dragover event is fired by the 'move' drag when dragging over another item.
    * @param id The id of the item underneath the dragged item, or null if the drag is over the background.
    * @param x The x location of the drag in view coordinates.
    * @param y The y location of the drag in view coordinates.
    * @param sub The sub-widget hovered over, or null if the hover is over the main part of the item.*/
    bind(name: 'dragover', handler: (id?: string, x?: number, y?: number, sub?: string) => void): void;

    /** The dragstart event is fired at the beginning of a drag. Return true from your event handler to prevent the default drag action occuring. For 'move' and 'hand' draggers, you can also return an object to control the drag operation, with the following properties: x (boolean) - whether dragging is allowed in the x-direction. The default is true. y (boolean) - whether dragging is allowed in the y-direction. The default is true. add (array) - an array of ids of items that will also be dragged, even if they are not selected. Applies to the 'move' dragger only.
    * @param type The type of the drag: 'move' or 'hand'
    * @param id The id of the item that is being dragged, or null if no item is being dragged.
    * @param x The x location of the drag in view coordinates.
    * @param y The y location of the drag in view coordinates.
    * @param sub The sub-widget dragged, or null if the drag is over the main part of the item.*/
    bind(name: 'dragstart', handler: (type?: 'hand' | 'move', id?: string, x?: number, y?: number, sub?: string) => DragControlOptions): void;

    /** The dragstart event is fired at the beginning of a drag. Return true from your event handler to prevent the default drag action occuring.
    * @param type The type of the drag: 'area', 'resize', 'offset', 'dummy' are all various types of drag.
    * @param id The id of the item that is being dragged, or null if no item is being dragged.
    * @param x The x location of the drag in view coordinates.
    * @param y The y location of the drag in view coordinates.
    * @param sub The sub-widget dragged, or null if the drag is over the main part of the item.*/
    bind(name: 'dragstart', handler: (type?: 'area' | 'resize' | 'offset' | 'dummy', id?: string, x?: number, y?: number, sub?: string) => boolean): void;

    /** The edit event is triggered when the user presses the F2 function button. It can be useful to listen to this if you would like to offer label edit functionality.*/
    bind(name: 'edit', handler: () => void): void;

    /** The hover event happens when the mouse hovers over an item for a second or when dragging an external element over the chart (e.g. HTML5 drag and drop).
    * @param id The id of the item the mouse is over, or null if the mouse is over the chart background.
    * @param x The x location of the mouse.
    * @param y The y location of the mouse.
    * @param sub The sub-widget hovered over, or null if the hover is over the main part of the item.*/
    bind(name: 'hover', handler: (id?: string, x?: number, y?: number, sub?: string) => void): void;

    /** The keydown event occurs as the end-user presses a key. Default action: various. Arrow keys move the selection, ctrl-A selects all, F2 raises edit event, and Del raises delete event. Return true to override this behaviour.
    * @param keyCode The keyCode of the key pressed.*/
    bind(name: 'keydown', handler: (keyCode?: number) => boolean): void;

    /** The map event is fired at the start and end of a map show or hide operation.
    * @param type The type of the event: 'showstart', 'showend', 'hidestart' or 'hideend'.*/
    bind(name: 'map', handler: (type?: string) => void): void;

    /** The mousedown event occurs as the end-user presses a mouse button. Default action: select/deselect items, depending on whether the mouse down occured on an item or the background, and whether the CTRL or SHIFT keys are pressed. Return true to override this behaviour.
    * @param id The id of the item under the mouse, or null if the mouse was on the chart background.
    * @param x The x location of the mouse cursor in view coordinates.
    * @param y The y location of the mouse cursor in view coordinates.
    * @param button The button used. 0 is logical left button, 1 is middle and 2 is logical right.
    * @param sub The sub-widget, or null if the mouse is over the main part of the item.*/
    bind(name: 'mousedown', handler: (id?: string, x?: number, y?: number, button?: number, sub?: string) => boolean): void;

    /** The mousewheel event occurs as the end-user uses a mouse wheel or scrolls using a trackpad. Default action: zooms the chart in or out. Return true to override this behaviour.
    * @param delta Abstract value describing how far the wheel 'turned'. The sign indicates the direction of the movement.
    * @param x The x location of the mouse cursor in view coordinates.
    * @param y The y location of the mouse cursor in view coordinates.*/
    bind(name: 'mousewheel', handler: (delta?: number, x?: number, y?: number) => boolean): void;

    /** The overview event is triggered when the user clicks on the overview icon.
    * @param state The final state of the overview after the action completes - either 'open' or 'close'.*/
    bind(name: 'overview', handler: (state?: string) => void): void;

    /** The prechange event is triggered whenever the chart changes by either a user action, such as dragging items, or programmatically by calling API methods.
    * @param change The change that is happening - one of 'arrange', 'combine', 'delete', 'expandMultiple', 'hide', 'layout', 'merge', 'move', 'offset', 'properties' or 'resize'.*/
    bind(name: 'prechange', handler: (change?: string) => void): void;

    /** The progress event is triggered during long running tasks such as layouts and centrality calculations.
    * @param task The task which is running, for example, 'layout' or 'betweenness'.
    * @param progress How near the task is to completion on a scale of 0 to 1, where 0 is just started and 1 is finished.*/
    bind(name: 'progress', handler: (task?: string, progress?: number) => void): void;

    /** The selectionchange event is triggered immediately after the end-user changes the selection by clicking or touching the chart surface. */
    bind(name: 'selectionchange', handler: () => void): void;

    /** The touchdown is triggered on touch devices when the end-user touches the chart surface. Default action: select an item if under the touch. Return true to override this behaviour.
    * @param id The id of the item under the touch, or null if the touch was on the chart background.
    * @param x The x location of the touch in view coordinates.
    * @param y The y location of the touch in view coordinates.
    * @param sub The sub-widget touched, or null if the touch was over the main part of the item.*/
    bind(name: 'touchdown', handler: (id?: string, x?: number, y?: number, sub?: string) => boolean): void;

    /** The viewchange event is fired after any view settings, such as zoom or pan. This event is also fired when the view state is changed programmatically.*/
    bind(name: 'viewchange', handler: () => void): void;
  }

  interface TimeBar {
    /** Clear removes all data from the time bar.*/
    clear(): void;

    /** The getIds function returns an array of the ids that have datetimes in the specified range.
    * @param dt1 The start of the required range of datetimes.
    * @param dt2 The end of the required range of datetimes.
    * @returns An array of the ids that have datetimes in the specified range.*/
    getIds(dt1: Date | number, dt2: Date | number): Array<string>;

    /** The inRange function determines whether the item has a datetime within the time bar's time range. Note that the item must have been loaded into the time bar.
    * @param item The item or id to range test.
    * @returns Returns true if the specified item exists in the time bar and has a datetime within the time range, otherwise false.*/
    inRange(item: TimeBarItem | string): boolean;

    /** Replaces the time bar data with the new data specified.
    * @param data The data to load into the time bar    */
    load(data: TimeBarData): Promise<void>;

    /** Inserts new data into the time bar, merging it with any existing time bar data.
    * @param items The KeyLines Time Bar data object or array of items to merge into the existing time bar data*/
    merge(items: TimeBarItem | TimeBarData): Promise<void>;

    /** The options function gets options for the time bar.*/
    options(): TimeBarOptions;

    /** The options function gets options for the time bar.
    * @param val The options function gets options for the time bar.
    * @returns A promise*/
    options(val: TimeBarOptions): Promise<void>;

    /** Pan the time bar in the direction specified.
    * @param direction Which direction to pan
    * @param options Options controlling the pan operation*/
    pan(direction?: "back" | "forward", options?: TimeBarPanOptions): Promise<void>;

    /** The pause function stops the continuous animation of the time bar range started by play().*/
    pause(): void;

    /** The play function starts or stops a continuous animation of the time bar range.
    * @param options Options controlling the play operation.*/
    play(options?: TimeBarPlayOptions): void;

    /** The range function gets the time range of the time bar.*/
    range(): TimeBarRangeResult;

    /** The range function sets the time range of the time bar.
    * @param dt1 the new start time for the time range of the time bar
    * @param dt2 the new end time for the time range of the time bar
    * @param options Options controlling the operation*/
    range(dt1: Date | number, dt2: Date | number, options?: TimeBarRangeOptions): Promise<void>;

    /** Gets the Time Bar selection lines.*/
    selection(): Array<string>;

    /** Sets the Time Bar selection lines.
    * @param items An array of items to be selected in the time bar, or an object if just one selection is made.
    * @returns An array of the current selections.*/
    selection(items: SelectionOptions | Array<SelectionOptions>): Array<string>;

    /** The unbind function detaches an event handler that was attached to an event with bind.
    * @param name The name of the event to be detached from, e.g., 'click'. You can also unbind multiple events in a single call, separating each one with a comma or space, e.g. 'start, end'.
    * @param handler The event handler that was supplied to the bind call.*/
    unbind(name?: string, handler?: Function): void;

    /** Zoom the time bar in the manner specified.
    * @param how How to zoom the time bar: 'in', 'out', 'fit' (fit the time range to the data)
    * @param options Options controlling the zoom operation*/
    zoom(how?: "in" | "out" | "fit", options?: TimeBarZoomOptions): Promise<void>;

    /** Binding to the all event will capture all events that occur within the KeyLines time bar. It is slightly different in structure to other events in that the first argument is the name of the event which was captured. The rest of the arguments depend on the type of event captured. Return true to override the event's default action
    * @param name The name of the event which was captured, e.g. 'click'.*/
    bind(name: 'all', handler: (name?: string) => boolean): void;

    /** The change event is fired when the time range of the time bar changes.  This event is also fired when the time range is changed programmatically. To get the new range, use the range function.*/
    bind(name: 'change', handler: () => void): void;

    /** The click event happens when the mouse clicks on the time bar.
    * @param type The type of thing clicked on: either 'bar', 'selection', 'scale', or null if there is nothing under the mouse.
    * @param index The index of the selection clicked on, or null for other click types.
    * @param value The value of either the bar or selection, or null for other click types.
    * @param x A suggested location for the tooltip in the x direction - the centre of the bar or selection point.
    * @param y A suggested location for the tooltip in the y direction - the height of the bar or selection point.
    * @param dt1 The date at the start of the clicked range.
    * @param dt2 The date at the end of the clicked range.*/
    bind(name: 'click', handler: (type?: string, index?: number, value?: number, x?: number, y?: number, dt1?: Date, dt2?: Date) => void): void;

    /** The contextmenu event happens when the user right-clicks on the time bar surface.
    * @param type The type of thing clicked on: either 'bar', 'selection', 'scale', or null if there is nothing under the mouse.
    * @param index The index of the selection clicked on, or null for other click types.
    * @param value The value of either the bar or selection, or null for other click types.
    * @param x A suggested location for the tooltip in the x direction - the centre of the bar or selection point.
    * @param y A suggested location for the tooltip in the y direction - the height of the bar or selection point.
    * @param dt1 The date at the start of the clicked range.
    * @param dt2 The date at the end of the clicked range.*/
    bind(name: 'contextmenu', handler: (type?: string, index?: number, value?: number, x?: number, y?: number, dt1?: Date, dt2?: Date) => void): void;

    /** The dblclick event happens when the mouse double-clicks on the time bar. On touch devices this is triggered when the user double-taps the time bar. Default action: Zoom in (animated) when double-clicking anywhere except the control bar. Return true to override this behaviour.
    * @param type The type of thing clicked on: either 'bar', 'selection', 'scale', or null if there is nothing under the mouse.
    * @param x A suggested location for the tooltip in the x direction - the centre of the bar or selection point.
    * @param y A suggested location for the tooltip in the y direction - the height of the bar or selection point.*/
    bind(name: 'dblclick', handler: (type?: string, x?: number, y?: number) => boolean): void;

    /** The dragcomplete event is fired after the default behaviour has been performed (if applicable) and everything is finished.
    * @param type The type of the drag: 'hand', 'left' or 'right'.
    * @param x The x location of the drag.
    * @param y They y location of the drag.*/
    bind(name: 'dragcomplete', handler: (type?: string, x?: number, y?: number) => void): void;

    /** The dragend event is fired at the end of a drag. Return true to make the drag snap back to its original position. Default behaviour: finish the drag action. The precise behaviour depends on the nature of the drag. Return true from your event handler to prevent the default drag action occuring.
    * @param type The type of the drag: 'hand', 'left' or 'right'.
    * @param x The x location of the drag.
    * @param y They y location of the drag.*/
    bind(name: 'dragend', handler: (type?: string, x?: number, y?: number) => boolean): void;

    /** The dragstart event is fired at the beginning of a drag. Return true from your event handler to prevent the default drag action occuring.
    * @param type The type of the drag: 'hand', 'left' or 'right'.
    * @param x The x location of the drag.
    * @param y They y location of the drag.*/
    bind(name: 'dragstart', handler: (type?: string, x?: number, y?: number) => boolean): void;

    /** The end 'data' event is triggered when the right slider reaches the last data point; the end 'range' event is triggered when the left slider reaches the last data point.
    * @param type The type of end reached, either 'data' or 'range'.*/
    bind(name: 'end', handler: (type?: string) => void): void;

    /** The hover event happens when the mouse hovers over the time bar.
    * @param type The type of thing hovered over: either 'bar', 'selection', 'scale', or null if there is nothing under the mouse.
    * @param index The index of the selection hovered over, or null for other hover types.
    * @param value The value of either the bar or selection, or null for other hover types.
    * @param x A suggested location for the tooltip in the x direction - the centre of the bar or selection point.
    * @param y A suggested location for the tooltip in the y direction - the height of the bar or selection point.
    * @param dt1 The date at the start of the hovered range.
    * @param dt2 The date at the end of the hovered range.*/
    bind(name: 'hover', handler: (type?: string, index?: number, value?: number, x?: number, y?: number, dt1?: Date, dt2?: Date) => void): void;

    /** The mousewheel event occurs as the end-user uses a mouse wheel or scrolls using a trackpad. Default action: zooms the time bar in or out. Return true to override this behaviour. Return true to override this behaviour.
    * @param delta Abstract value describing how far the wheel 'turned'. The sign indicates the direction of the movement.
    * @param x The x location of the mouse cursor.
    * @param y The y location of the mouse cursor.*/
    bind(name: 'mousewheel', handler: (delta?: number, x?: number, y?: number) => boolean): void;

    /** The pause event is triggered whenever the time bar stops playing by the user pressing the pause button or programmatically calling timebar.pause(). It is also called when the time bar stops playing when it reaches the end of the range.*/
    bind(name: 'pause', handler: () => void): void;

    /** The play event is triggered whenever the time bar starts to play.
    * @param type The type of play mode, either 'extend' or 'normal'.*/
    bind(name: 'play', handler: (type?: string) => void): void;

    /** The start 'data' event is triggered when the left slider reaches the first data point; the start 'range' event is triggered when the right slider reaches the first data point.
    * @param type The type of start reached, either 'data' or 'range'.*/
    bind(name: 'start', handler: (type?: string) => void): void;

    /** The touchdown event happens when the user touches the time bar on a touch enabled device.
    * @param type The type of thing touched on: either 'bar', 'selection', 'scale', or null if there is nothing under the touch point.
    * @param index The index of the selection touched on, or null for other touch types.
    * @param value The value of either the bar or selection, or null for other touch types.
    * @param x A suggested location for the tooltip in the x direction - the centre of the bar or selection point.
    * @param y A suggested location for the tooltip in the y direction - the height of the bar or selection point.
    * @param dt1 The date at the start of the touched range.
    * @param dt2 The date at the end of the touched range.*/
    bind(name: 'touchdown', handler: (type?: string, index?: number, value?: number, x?: number, y?: number, dt1?: Date, dt2?: Date) => void): void;
  }

  interface Combo {
    /** Combines the nodes specified into a single 'combo' node.  Any links between the nodes are no longer displayed.
    * @param comboDefinition A definition of the combo to create, or an array of definitions.
    * @param options Options controlling the combine operation.
    * @returns A Promise.*/
    combine(comboDefinition: ComboDefinition | Array<ComboDefinition>, options?: CombineOptions): Promise<Array<string>>;

    /** find(ids) Returns an array of combo ids that contains the given items.
    * @param ids The ids of the items to be looked up.
    * @returns The ids of the combos containing the given items, or null if not found.*/
    find(ids: Array<string>): Array<string>;

    /** find(id) Returns a string
    * @param id The id of the item to be looked up.
    * @returns The id of the combo containing the given items, or null if not found.*/
    find(id: string): string;

    /** Returns all the nodes and links within the combo, or null if the id is not a combo.
    * @param id The id of the combo.
    * @returns An object in the form {links:[link1, link2, ..], nodes:[node1, node2, ..]}*/
    info(id: string): any;

    /** isCombo is used to test whether a node or link is a combo, or just a normal item.
    * @param id The id string or the array of id strings of the items to be tested.
    * @param options Options controlling which whether links or nodes are tested.
    * @returns True if any node or link id are a combo, false otherwise.*/
    isCombo(id: string | Array<string>, options?: IsComboOptions): boolean;

    /** Uncombines the specified combo: any nodes within the combo will be shown again on chart surface.
    * @param id The id or the array of ids of the combos to be uncombined.
    * @param options Options controlling the uncombine operation.
    * @returns A Promise.*/
    uncombine(id: string | Array<string>, options?: UncombineOptions): Promise<void>;
  }

  interface Map {
    /** Hide the map that was displayed with the show function. Chart nodes with lat and lng  properties are repositioned as specified by the 'transition'options setting. The speed of the transition depends on settings made with the options function.
    * @returns A Promise.*/
    hide(): Promise<void>;

    /** Use isShown to discover whether the map is currently shown.*/
    isShown(): boolean;

    /** Use leafletMap to get direct access to the underlying Leaflet map object that is used in map mode.*/
    leafletMap(): any;

    /** Use mapCoordinates to discover the exact latitude and longitude coordinates of a point given its view coordinates.
    * @param x The x position in view coordinates.
    * @param y The y position in view coordinates.
    * @returns An object {lat: lat, lng: lng} containing the map coordinates        */
    mapCoordinates(x: number, y: number): Location;

    /** The options function sets the options for the map.
    * @param val sets the map options
    * @returns The current options*/
    options(val: MapOptions): Promise<void>;

    /** The options function gets the options for the map.*/
    options(): MapOptions;

    /** Display a map behind the chart. Chart nodes with lat and lng properties are moved to the correct position on the map*/
    show(): Promise<void>;

    /** Use viewCoordinates to discover the exact position in view coordinates of a point given its latitude and longitude.
    * @param lat The latitude position of the point.
    * @param lng The longitude position of the point.
    * @returns An object {x: x, y: y} containing the view coordinates    */
    viewCoordinates(lat: number, lng: number): Coordinates;
  }

  interface Graph {
    /** The betweenness function calculates the betweenness centrality of all nodes in the graph.
    * @param options Various options which define if the graph is directed, the result normalized and values associated with the links
    * @returns A dictionary whose properties are the ids of the nodes in the graph. The values are the betweenness values. */
    betweenness(options?: BetweennessOptions): Promise<IdMap<number>>;

    /** Clear removes all items from the graph engine.   */
    clear(): void;

    /** The closeness function calculates the closeness centrality of all nodes in the graph.
    * @param options Various options which define if the graph is directed, the result normalized and values associated with the links
    * @returns A dictionary whose properties are the ids of the nodes in the graph. The values are the closeness values. */
    closeness(options?: ClosenessOptions): Promise<IdMap<number>>;

    /** The clusters function groups the nodes of the graph into different clusters.
    * @param options Options which control how the calculation is done.
    * @returns An array [cluster1, cluster2, ...] where cluster1, cluster2... are arrays containing ids of nodes that are all in the same cluster.*/
    clusters(options?: ClustersOptions): Array<Array<string>>;

    /** The components function returns the separate 'connected components' of the graph.
    * @param options Various options which define special rules for items iteration.
    * @returns An array of objects of the form {nodes:[id1, id2, ..], links:[id3, id4, ..]}, one entry for each component.*/
    components(options?: ComponentsOptions): Array<ComponentsResult>;

    /** The degrees function calculates the degrees (number of links) of all nodes in the graph.
    * @param options Various options which define the direction and values associated with the links
    * @returns An object whose properties are the ids of the nodes, the values of which are the degree values.*/
    degrees(options?: DegreesOptions): IdMap<number>;

    /** The distances function calculates the distances of all nodes from the node specified. The distance is the number of edges in a shortest path.
    * @param id The id of the node to start from.
    * @param options Various options for the direction and values associated with the paths
    * @returns A dictionary object, the properties are the ids of the nodes, and the values are the distances.*/
    distances(id: string, options?: DistancesOptions): IdMap<number>;

    /** Call eigenCentrality to compute the eigenvector centrality of each node.
    * @param options Various options which define special rules for the eigenCentrality computation
    * @returns An object in the form {id1: result1, id2: result2, ...} containing the eigenvector centrality of each node.*/
    eigenCentrality(options?: EigenCentralityOptions): IdMap<number>;

    /** The kCores function calculates subgraphs of the graph where each node has a degree at least k. It works by successively removing nodes of degree less than k until no further nodes can be removed.
    * @param options Various options which define special rules for items iteration.
    * @returns An object which describes the kCores found*/
    kCores(options?: KCoresOptions): KCoresResult;

    /** Replaces the graph data with the new data specified.
    * @param data The data to load into the graph engine*/
    load(data: ChartData): void;

    /** Call neighbours to find out which items are neighbours (are linked) to the id or ids passed in.
    * @param id The id string (or array of id strings) of the items whose neighbours should be found
    * @param options Various options which define special rules for items iteration.
    * @returns An object in the form {links:[id1, id2, ..], nodes:[id3, id4, ..]}*/
    neighbours(id?: string | Array<string>, options?: NeighboursOptions): NeighboursResult;

    /** Computes the PageRank of each node.
    * @param options Various options which define special rules for PageRank computation
    * @returns An object in the form {id1: result1, id2: result2, ...} containing the PageRank of each node.*/
    pageRank(options?: PageRankOptions): IdMap<number>;

    /** The shortestPaths function calculates all the shortest paths between the nodes specified.
    * @param id1 The id of the starting node on the path.
    * @param id2 The id of the ending node on the path.
    * @param options Various options for the direction and values associated with the paths
    * @returns An object which describes the path structure*/
    shortestPaths(id1?: string, id2?: string, options?: ShortestPathsOptions): ShortestPathsResult;
  }

  interface KeyLines {
    /** The components object has all the current components loaded by the KeyLines wrapper.*/
    components(): any;

    /** The coords function is a convenience function for discovering the coordinates of events relative to their target.
    * @param evt A DOM or jQuery event.
    * @returns An object whose properties 'x' and 'y' are the coordinates in 'target space'.*/
    coords(evt: Event): Coordinates;

    /** Creates a KeyLines Chart in your web page in the HTML element with the given id.
    * @param id The id of the HTML element to replace with the Chart.
    * @returns A promise with the created Chart.*/
    create(id: string): Promise<Chart>;

    /** Creates a KeyLines component in your web page using an object defining the component.
    * @param component The definition object for the component.
    * @returns A promise with the created component.*/
    create(component: Component): Promise<Chart | TimeBar>;

    /** Creates KeyLines components in your web page using the objects supplied, defining the components.
    * @param components An array containing definition objects for the components.
    * @returns A promise with the created component.*/
    create(components: Array<Component>): Promise<Array<Chart | TimeBar>>;

    /** Use dashedLineSupport to discover whether the current browser can draw dashed lines.*/
    dashedLineSupport(): boolean;

    /** Use fullScreenCapable to discover whether the current browser can show elements full screens.*/
    fullScreenCapable(): boolean;

    /** The getFontIcon function is a helper to find the right character to use for the icon based on the class name.
    * @param classes A string containing the class names required to get the font icon.
    * @returns A string to be used as font icon.*/
    getFontIcon(classes: string): string;

    /** The Graph engine can be used to perform traversals or other graph computations within a separate context from the chart.
    * @param options Options for the graph engine.
    * @returns A new instance of the graph engine used by KeyLines.*/
    getGraphEngine(options?: GraphEngineOptions): Graph;

    /** Mode defines which runtime KeyLines will use when calling KeyLines.create.
    * @param value The mode to use
    * @returns The current mode.  */
    mode(value: "auto" | "webgl" | "canvas"): string;

    /** The paths function tells KeyLines where it can find various resources on your server.
    * @param value An object specifying paths to assets and image resources.
    * @returns An object containing the current path settings.*/
    paths(value: PathsOptions): any;

    /** Use promisify to make the KeyLines API promise-aware.
    * @param Promise A valid Promise A/A+ constructor. By default, it'll use ES6 native promises if your browser supports it.*/
    promisify(Promise?: PromiseConstructor): void;

    /** setSize must be called when you change the size of the component.
    * @param id The id of the component element.
    * @param width The new width in pixels.
    * @param height The new height in pixels.*/
    setSize(id: string, width: number, height: number): void;

    /** toggleFullScreen allows a given HTMLElement to be put in Full Screen mode, using the browser's full screens API.
    * @param element The element which should be made full screens. Cannot be null.
    * @param handler A function which will be called once the operation is complete.*/
    toggleFullScreen(element: HTMLElement, handler?: Function): void;

    /** Checks whether this device supports WebGL and meets the minimum requirements.*/
    webGLSupport(): boolean;
  }
}







