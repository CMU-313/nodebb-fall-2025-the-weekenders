<div>
	<a href="{config.relative_path}/user/{./userslug}" class="btn btn-ghost gap-2 ff-base d-flex align-items-start justify-content-start p-2 text-start">
		{buildAvatar(@value, "48px", true, "flex-shrink-0")}
		<div class="d-flex flex-column gap-1 text-truncate">
				<div class="d-flex align-items-center gap-1 text-truncate">
					<span class="fw-semibold text-truncate" title="{./displayname}">{./displayname}</span>
					{{{ if ./helpfulnessScore }}}
				<span class="helpfulness-badge badge bg-primary-subtle text-primary text-xs fw-semibold" title="[[user:helpfulness-title, {txEscape(formattedNumber(./helpfulnessScore))}]]">
					<i class="fa-solid fa-thumbs-up"></i>
					<span>{formattedNumber(./helpfulnessScore)}</span>
				</span>
				{{{ end }}}
			</div>
			<div class="text-xs text-muted text-truncate">@{./username}</div>

			{{{ if section_online }}}
			<div class="text-xs text-muted text-truncate">
				<span class="timeago" title="{./lastonlineISO}"></span>
			</div>
			{{{ end }}}

			{{{ if section_joindate }}}
			<div class="text-xs text-muted text-truncate">
				<span class="timeago" title="{./joindateISO}"></span>
			</div>
			{{{ end }}}

			{{{ if section_sort-reputation }}}
			<div class="text-xs text-muted text-truncate">
				<span>{formattedNumber(./reputation)}</span>
			</div>
			{{{ end }}}

			{{{ if section_sort-helpfulness }}}
			<div class="text-xs text-muted text-truncate">
				<span>{formattedNumber(./helpfulnessScore)}</span>
			</div>
			{{{ end }}}

			{{{ if section_sort-posts }}}
			<div class="text-xs text-muted text-truncate">
				<span>{formattedNumber(./postcount)}</span>
			</div>
			{{{ end }}}

			{{{ if section_flagged }}}
			<div class="text-xs text-muted text-truncate">
				<span>{formattedNumber(./flags)}</span>
			</div>
			{{{ end }}}
		</div>
	</a>
</div>
