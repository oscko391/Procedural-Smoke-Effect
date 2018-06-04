
varying vec3 v_pos;

void main()
{
    v_pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = v_pos;
}
