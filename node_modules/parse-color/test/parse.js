var parse = require('../');
var test = require('tape');

test('readme examples', function (t) {
    t.plan(6);
    t.deepEqual(parse('#ffa500'), {
        rgb: [ 255, 165, 0 ],
        hsl: [ 39, 100, 50 ],
        hsv: [ 39, 100, 100 ],
        cmyk: [ 0, 35, 100, 0 ],
        keyword: 'orange',
        hex: '#ffa500',
        rgba: [ 255, 165, 0, 1 ],
        hsla: [ 39, 100, 50, 1 ],
        hsva: [ 39, 100, 100, 1 ],
        cmyka: [ 0, 35, 100, 0, 1 ]
    });
    t.deepEqual(parse('#333'), {
        rgb: [ 51, 51, 51 ],
        hsl: [ 0, 0, 20 ],
        hsv: [ 0, 0, 20 ],
        cmyk: [ 0, 0, 0, 80 ],
        keyword: undefined,
        hex: '#333333',
        rgba: [ 51, 51, 51, 1 ],
        hsla: [ 0, 0, 20, 1 ],
        hsva: [ 0, 0, 20, 1 ],
        cmyka: [ 0, 0, 0, 80, 1 ],
    });
    t.deepEqual(parse('#f98'), {
        rgb: [ 255, 153, 136 ],
        hsl: [ 9, 100, 77 ],
        hsv: [ 9, 47, 100 ],
        cmyk: [ 0, 40, 47, 0 ],
        keyword: undefined,
        hex: '#ff9988',
        rgba: [ 255, 153, 136, 1 ],
        hsla: [ 9, 100, 77, 1 ],
        hsva: [ 9, 47, 100, 1 ],
        cmyka: [ 0, 40, 47, 0, 1 ],
    });
    t.deepEqual(parse('lime'), {
        rgb: [ 0, 255, 0 ],
        hsl: [ 120, 100, 50 ],
        hsv: [ 120, 100, 100 ],
        cmyk: [ 100, 0, 100, 0 ],
        keyword: 'lime',
        hex: '#00ff00',
        rgba: [ 0, 255, 0, 1 ],
        hsla: [ 120, 100, 50, 1 ],
        hsva: [ 120, 100, 100, 1 ],
        cmyka: [ 100, 0, 100, 0, 1 ]
    });
    t.deepEqual(parse('hsl(210,50,50)'), {
        rgb: [ 64, 127, 191 ],
        hsl: [ 210, 50, 50 ],
        hsv: [ 210, 67, 75 ],
        cmyk: [ 67, 33, 0, 25 ],
        keyword: undefined,
        hex: '#407fbf',
        rgba: [ 64, 127, 191, 1 ],
        hsla: [ 210, 50, 50, 1 ],
        hsva: [ 210, 67, 75, 1 ],
        cmyka: [ 67, 33, 0, 25, 1 ] 
    });
    t.deepEqual(parse('rgba(153,50,204,60%)'), {
        rgb: [ 153, 50, 204 ],
        hsl: [ 280, 61, 50 ],
        hsv: [ 280, 75, 80 ],
        cmyk: [ 25, 75, 0, 20 ],
        keyword: 'darkorchid',
        hex: '#9932cc',
        rgba: [ 153, 50, 204, 0.6 ],
        hsla: [ 280, 61, 50, 0.6 ],
        hsva: [ 280, 75, 80, 0.6 ],
        cmyka: [ 25, 75, 0, 20, 0.6 ]
    });
});
