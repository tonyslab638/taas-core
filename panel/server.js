che...
==> Cloning from https://github.com/tonyslab638/taas-core
==> Checking out commit 8257755d054805d7df25f1a3822f4299affbf7e1 in branch main
==> Downloaded 318MB in 5s. Extraction took 6s.
==> Using Node.js version 22.22.0 (default)
==> Docs on specifying a Node.js version: https://render.com/docs/node-version
==> Running build command 'npm install'...
up to date, audited 650 packages in 2s
123 packages are looking for funding
  run `npm fund` for details
35 vulnerabilities (22 low, 13 moderate)
To address issues that do not require attention, run:
  npm audit fix
Some issues need review, and may require choosing
a different dependency.
Run `npm audit` for details.
==> Uploading build...
==> Uploaded in 8.1s. Compression took 4.2s
==> Build successful 🎉
==> Deploying...
==> Setting WEB_CONCURRENCY=1 by default, based on available CPUs in the instance
==> Running 'node server.js'
node:fs:440
    return binding.readFileUtf8(path, stringToFlags(options.flag));
                   ^
Error: ENOENT: no such file or directory, open './abi/TaaSProductBirth.json'
    at Object.readFileSync (node:fs:440:20)
    at file:///opt/render/project/src/panel/server.js:16:27
    at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:665:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: './abi/TaaSProductBirth.json'
}
Node.js v22.22.0
==> Running 'node server.js'
node:fs:440
    return binding.readFileUtf8(path, stringToFlags(options.flag));
                   ^
Error: ENOENT: no such file or directory, open './abi/TaaSProductBirth.json'
    at Object.readFileSync (node:fs:440:20)
    at file:///opt/render/project/src/panel/server.js:16:27
    at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:665:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: './abi/TaaSProductBirth.json'
}
Node.js v22.22.0