import os, pty, sys, time, select, fcntl, termios, struct, signal
stage, keys, out, cols, rows = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
pid, fd = pty.fork()
if pid == 0:
    os.environ.update(STAGE=stage, TERM='xterm-256color', FORCE_COLOR='1', COLUMNS=str(cols), LINES=str(rows))
    os.execvp('node', ['node', 'flow.mjs'])
fcntl.ioctl(fd, termios.TIOCSWINSZ, struct.pack('HHHH', rows, cols, 0, 0))
buf = b''
def pump(t):
    global buf
    end = time.time() + t
    while time.time() < end:
        r, _, _ = select.select([fd], [], [], 0.1)
        if r:
            try: buf += os.read(fd, 65536)
            except OSError: return
pump(1.5)
for k in keys:
    os.write(fd, {'E': b'\r', 'L': b'\x1b[D', 'R': b'\x1b[C'}[k]); pump(0.8)
pump(1.0)
os.kill(pid, signal.SIGKILL)
open(out, 'wb').write(buf)
