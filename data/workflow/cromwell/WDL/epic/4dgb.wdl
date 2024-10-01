workflow genome_browser {
    String proj_dir
    String outdir

    call build {
        input: input_dir=proj_dir,
                outdir=outdir
    }
}

task build {
    String input_dir
    String DOCKER = "4dgb/4dgbworkflow-build"
    String outdir

    command <<<

        python3 /scripts/workflow.py ${input_dir} ${outdir}

    >>>

    output {
	      Array[String] out = read_lines(stdout())
    }
    runtime {
        docker: DOCKER
        cpu: 1
        node: 1
        nwpn: 1
        mem: "120G"
        time: "04:00:00"
    }
}
